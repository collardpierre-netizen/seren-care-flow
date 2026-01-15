-- Drop the overly permissive RLS policy on stock_alerts
DROP POLICY IF EXISTS "Service role can manage stock alerts" ON public.stock_alerts;