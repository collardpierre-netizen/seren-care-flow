/**
 * Debug helpers for the Shop page.
 *
 * Two layers:
 *   1. Generic primitives (`buildShopDebugPayload`, `logShopDebug`).
 *   2. Mobility-specific wrappers (`buildMobilityDebugLog`, `logMobilityDebug`).
 *
 * ## Production stripping
 *
 * Every helper short-circuits when `isDev` is `false`. On top of that, the
 * mobility logger accepts a **lazy** field provider so the values themselves
 * are never evaluated in production:
 *
 *     if (import.meta.env.DEV) {
 *       logMobilityDebug(() => ({
 *         profileMobilityLevel: profile.mobility_level,
 *         appliedFilterTag: filters.mobility,
 *       }));
 *     }
 *
 * Combined with the literal `import.meta.env.DEV` guard at the call site,
 * Vite/esbuild can statically eliminate the entire block from the production
 * bundle (the constant folds to `false`, dead-code elimination removes the
 * branch, and the message string disappears).
 */

const SHOP_DEBUG_PREFIX = '[Shop]';

/**
 * `true` only in dev builds. Re-exported so call sites do not have to import
 * `import.meta` when they only need a boolean — but the strongest production
 * stripping still requires the literal `import.meta.env.DEV` guard at the
 * call site (constant folding works on the literal, not on a re-export).
 */
export const IS_SHOP_DEBUG_ENABLED: boolean = Boolean(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (import.meta as any)?.env?.DEV,
);

export type ShopDebugValue = string | number | boolean | null | undefined;

export type ShopDebugPayload<K extends string = string> = Record<K, string | null>;

export interface BuildShopDebugPayloadOptions<K extends string> {
  isDev: boolean;
  fields: Record<K, ShopDebugValue>;
}

/**
 * Build a normalised, dev-only payload. Returns `null` when `isDev` is false
 * so callers can skip downstream work entirely.
 */
export function buildShopDebugPayload<K extends string>(
  options: BuildShopDebugPayloadOptions<K>,
): ShopDebugPayload<K> | null {
  if (!options.isDev) return null;
  const out = {} as ShopDebugPayload<K>;
  for (const key of Object.keys(options.fields) as K[]) {
    const raw = options.fields[key];
    out[key] = raw === undefined || raw === null ? null : String(raw);
  }
  return out;
}

/**
 * Generic Shop debug logger. Builds the payload via `buildShopDebugPayload`
 * and forwards it to `console.debug` with the shared `[Shop]` prefix.
 *
 * No-op (and no message string built) when `isDev` is false.
 */
export function logShopDebug<K extends string>(
  message: string,
  options: BuildShopDebugPayloadOptions<K>,
): ShopDebugPayload<K> | null {
  if (!options.isDev) return null;
  const payload = buildShopDebugPayload(options);
  if (!payload) return null;
  // eslint-disable-next-line no-console
  console.debug(`${SHOP_DEBUG_PREFIX} ${message}`, payload);
  return payload;
}

// ---------------------------------------------------------------------------
// Mobility-specific helpers
// ---------------------------------------------------------------------------

export const MOBILITY_DEBUG_FIELDS = [
  'profile_mobility_level',
  'applied_filter_tag',
] as const;

export type MobilityDebugField = (typeof MOBILITY_DEBUG_FIELDS)[number];

export type MobilityDebugPayload = ShopDebugPayload<MobilityDebugField>;

export interface MobilityDebugFields {
  profileMobilityLevel: ShopDebugValue;
  appliedFilterTag: ShopDebugValue;
}

/**
 * Build the mobility debug payload (eager variant). Pass `isDev` explicitly.
 */
export function buildMobilityDebugLog(
  options: { isDev: boolean } & MobilityDebugFields,
): MobilityDebugPayload | null {
  return buildShopDebugPayload({
    isDev: options.isDev,
    fields: {
      profile_mobility_level: options.profileMobilityLevel,
      applied_filter_tag: options.appliedFilterTag,
    },
  });
}

/**
 * Log the mobility debug payload via the shared Shop logger.
 *
 * The single argument is a **lazy provider** — the function is only invoked
 * when debug logging is actually enabled, so any expensive lookup (or PII
 * field access) inside it is fully skipped in production.
 *
 * Pair with a literal `import.meta.env.DEV` guard at the call site to allow
 * the bundler to drop the entire block:
 *
 *     if (import.meta.env.DEV) {
 *       logMobilityDebug(() => ({
 *         profileMobilityLevel: profile.mobility_level,
 *         appliedFilterTag: filters.mobility,
 *       }));
 *     }
 */
export function logMobilityDebug(
  fieldsProvider: () => MobilityDebugFields,
): MobilityDebugPayload | null {
  if (!IS_SHOP_DEBUG_ENABLED) return null;
  const fields = fieldsProvider();
  return logShopDebug('mobility filter from profile', {
    isDev: true,
    fields: {
      profile_mobility_level: fields.profileMobilityLevel,
      applied_filter_tag: fields.appliedFilterTag,
    },
  });
}
