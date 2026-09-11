import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") ?? "";

export interface AuthResult {
  ok: boolean;
  status: number;
  error?: string;
  userId?: string;
  isAdmin?: boolean;
  viaInternal?: boolean;
}

/** Constant-time-ish string comparison to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the caller presents the shared server-to-server secret. */
export function hasInternalSecret(req: Request): boolean {
  if (!INTERNAL_FUNCTION_SECRET) return false;
  const provided = req.headers.get("x-internal-secret") ?? "";
  return safeEqual(provided, INTERNAL_FUNCTION_SECRET);
}

/** True when the Authorization header carries the service role key directly. */
export function hasServiceRoleKey(req: Request): boolean {
  if (!SERVICE_ROLE_KEY) return false;
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  return safeEqual(token, SERVICE_ROLE_KEY);
}

/**
 * Authorize a request as either:
 *  - an internal server-to-server call (shared secret or service role key), or
 *  - a signed-in user (optionally required to be admin/manager).
 */
export async function authorize(
  req: Request,
  opts: { allowInternal?: boolean; requireAdmin?: boolean } = {},
): Promise<AuthResult> {
  const { allowInternal = true, requireAdmin = false } = opts;

  if (allowInternal && (hasInternalSecret(req) || hasServiceRoleKey(req))) {
    return { ok: true, status: 200, viaInternal: true, isAdmin: true };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const userId = data.user.id;

  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "manager"]);

  const isAdmin = !!roles && roles.length > 0;

  if (requireAdmin && !isAdmin) {
    return { ok: false, status: 403, error: "Forbidden", userId, isAdmin: false };
  }

  return { ok: true, status: 200, userId, isAdmin };
}

export function unauthorizedResponse(
  result: AuthResult,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ success: false, error: result.error ?? "Unauthorized" }),
    { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
