-- stock_alerts: the token-based unsubscribe policy had USING (true), so anyone
-- could deactivate any alert. Unsubscribing goes through the service-role
-- edge function, which bypasses RLS, so the public policy is not needed.
DROP POLICY IF EXISTS "Allow unsubscribe by token only" ON public.stock_alerts;

CREATE POLICY "Users can update own stock alerts"
ON public.stock_alerts FOR UPDATE TO authenticated
USING (email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()))
WITH CHECK (email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Users can delete own stock alerts"
ON public.stock_alerts FOR DELETE TO authenticated
USING (email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()));

-- order_preparer_logs: WITH CHECK (true) for the public role let anyone forge
-- audit entries. All real inserts come from service-role edge functions,
-- which bypass RLS.
DROP POLICY IF EXISTS "Service role can insert preparer logs" ON public.order_preparer_logs;

-- preparer_earned_badges: same problem, anyone could grant themselves badges.
DROP POLICY IF EXISTS "Service role can insert earned badges" ON public.preparer_earned_badges;