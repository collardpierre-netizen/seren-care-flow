-- Drop the overly permissive INSERT policy on order_items
DROP POLICY IF EXISTS "System can insert order items" ON public.order_items;

-- Create a more restrictive policy that only allows:
-- 1. Service role (edge functions) to insert items
-- 2. Users to insert items ONLY for their own orders that are in 'order_received' status and recently created
-- This prevents users from inserting items to other users' orders or to already processed orders

CREATE POLICY "Users can insert items to own recent orders" 
ON public.order_items
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      -- Authenticated user owns the order
      (orders.user_id = auth.uid() AND auth.uid() IS NOT NULL)
      OR 
      -- Guest checkout (both null)
      (orders.user_id IS NULL AND auth.uid() IS NULL)
    )
    AND orders.status = 'order_received'
    AND orders.created_at > NOW() - INTERVAL '10 minutes'
  )
);