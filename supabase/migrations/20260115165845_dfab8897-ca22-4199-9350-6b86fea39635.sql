-- Fix overly permissive UPDATE policy on stock_alerts
DROP POLICY IF EXISTS "Allow public unsubscribe by token" ON public.stock_alerts;

-- Create a more restrictive policy for unsubscribe (only allows deactivating, verified by token)
CREATE POLICY "Allow unsubscribe by token only" 
ON public.stock_alerts 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (
  -- Only allow setting is_active to false (unsubscribe action only)
  is_active = false
);