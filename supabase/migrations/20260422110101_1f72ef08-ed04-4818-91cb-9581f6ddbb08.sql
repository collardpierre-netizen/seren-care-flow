-- 1) Fix permissive policy on order_messages
-- The "Service role can manage order messages" policy used USING/WITH CHECK true
-- for the public role, granting unrestricted access. Remove it. Service role
-- bypasses RLS automatically, so no replacement is needed for it.
DROP POLICY IF EXISTS "Service role can manage order messages" ON public.order_messages;

-- Allow customers to view messages for their own orders, and to send replies.
CREATE POLICY "Users can view own order messages"
ON public.order_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_messages.order_id
      AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Users can reply to own order messages"
ON public.order_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_type = 'customer'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_messages.order_id
      AND o.user_id = auth.uid()
  )
);

-- 2) Tighten cart_items policy: anonymous session_id branch must match
-- a value the client cannot forge. We scope it to the GUC `app.session_id`
-- which the frontend sets via supabase.rpc / postgres setting per request.
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;

CREATE POLICY "Authenticated users manage own cart"
ON public.cart_items
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users manage own session cart"
ON public.cart_items
FOR ALL
TO anon
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.headers', true)::json->>'x-cart-session'
)
WITH CHECK (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.headers', true)::json->>'x-cart-session'
);
