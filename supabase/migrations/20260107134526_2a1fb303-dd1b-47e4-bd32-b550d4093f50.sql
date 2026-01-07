-- Create table to track order item preparation status
CREATE TABLE public.order_item_preparation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  prepared_quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  prepared_at TIMESTAMP WITH TIME ZONE,
  prepared_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_item_id)
);

-- Enable RLS
ALTER TABLE public.order_item_preparation ENABLE ROW LEVEL SECURITY;

-- Allow admin/manager to manage preparation status
CREATE POLICY "Admins can manage preparation" 
ON public.order_item_preparation 
FOR ALL 
USING (public.is_admin_or_manager(auth.uid()));

-- Allow anonymous access for preparers with valid token (handled by edge function)
CREATE POLICY "Allow insert for service role" 
ON public.order_item_preparation 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable realtime for preparation updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_item_preparation;

-- Add trigger for updated_at
CREATE TRIGGER update_order_item_preparation_updated_at
BEFORE UPDATE ON public.order_item_preparation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();