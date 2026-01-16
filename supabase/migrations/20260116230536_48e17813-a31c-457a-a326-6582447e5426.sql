-- Table for order messages (real-time chat between preparer and admin)
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'preparer')),
  sender_name TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all messages
CREATE POLICY "Admins can manage order messages"
ON public.order_messages
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Policy for preparers to insert messages (via service role from edge function)
CREATE POLICY "Service role can manage order messages"
ON public.order_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- Table for tracking preparer activity/logs on orders
CREATE TABLE public.order_preparer_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'link_opened', 'started_preparation', 'completed', 'added_note'
  details TEXT,
  preparer_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_preparer_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read logs
CREATE POLICY "Admins can read preparer logs"
ON public.order_preparer_logs
FOR SELECT
USING (public.is_admin_or_manager(auth.uid()));

-- Policy for service role to insert logs
CREATE POLICY "Service role can insert preparer logs"
ON public.order_preparer_logs
FOR INSERT
WITH CHECK (true);

-- Add preparer_notes column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS preparer_notes TEXT;

-- Enable realtime for order_messages (for WhatsApp-like chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;

-- Create index for faster queries
CREATE INDEX idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_created_at ON public.order_messages(created_at DESC);
CREATE INDEX idx_order_preparer_logs_order_id ON public.order_preparer_logs(order_id);