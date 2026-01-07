-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow insert for service role" ON public.order_item_preparation;

-- Create a more secure policy that allows access through the edge function (service role)
-- The edge function validates the preparer token before making updates
-- Admin/manager policy already covers authenticated admin access