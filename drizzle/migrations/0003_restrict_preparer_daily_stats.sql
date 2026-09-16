DROP POLICY IF EXISTS "Daily stats are viewable by everyone" ON public.preparer_daily_stats;
DROP POLICY IF EXISTS "Service role can manage daily stats" ON public.preparer_daily_stats;

REVOKE ALL ON public.preparer_daily_stats FROM anon;
GRANT SELECT ON public.preparer_daily_stats TO authenticated;
GRANT ALL ON public.preparer_daily_stats TO service_role;

ALTER TABLE public.preparer_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view daily stats"
ON public.preparer_daily_stats
FOR SELECT
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Service role can manage daily stats"
ON public.preparer_daily_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);