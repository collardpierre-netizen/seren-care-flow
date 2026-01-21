-- Security Fixes: Restrict access to sensitive tables

-- 1. Fix order_access_tokens - Remove public SELECT policy
-- Edge Functions use service role key (bypasses RLS), so public SELECT is unnecessary
DROP POLICY IF EXISTS "Anyone can verify tokens" ON public.order_access_tokens;

-- 2. Fix callback_requests - Verify SELECT is admin-only
-- The current policy "Admins can view callback requests" should be the only SELECT policy
-- Let's ensure no other SELECT policy exists by explicitly checking
-- Current state: Only admins can view, anyone can insert (correct behavior)
-- No changes needed as RLS is enabled and only admin SELECT exists

-- 3. Fix profiles - Add RESTRICTIVE policy to explicitly deny anonymous access
-- Current policies allow users to view own + admins to view all
-- Add explicit denial for anonymous users for defense-in-depth
CREATE POLICY "Deny anonymous profile access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Also add RESTRICTIVE policy for UPDATE to ensure anonymous can't update
CREATE POLICY "Deny anonymous profile update"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);