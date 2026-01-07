-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_suppliers table (link products to suppliers)
CREATE TABLE public.product_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_sku TEXT,
  purchase_price NUMERIC,
  min_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, supplier_id)
);

-- Create reorder_requests table
CREATE TABLE public.reorder_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  total_amount NUMERIC,
  ordered_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reorder_items table
CREATE TABLE public.reorder_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reorder_request_id UUID NOT NULL REFERENCES public.reorder_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_size TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_notifications table for real-time alerts
CREATE TABLE public.stock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_size TEXT,
  order_id UUID REFERENCES public.orders(id),
  notification_type TEXT NOT NULL, -- 'low_stock', 'out_of_stock', 'unavailable_preparation'
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

-- Admin policies for suppliers
CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Admin policies for product_suppliers
CREATE POLICY "Admins can manage product_suppliers"
ON public.product_suppliers FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Admin policies for reorder_requests
CREATE POLICY "Admins can manage reorder_requests"
ON public.reorder_requests FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Admin policies for reorder_items
CREATE POLICY "Admins can manage reorder_items"
ON public.reorder_items FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Admin policies for stock_notifications
CREATE POLICY "Admins can manage stock_notifications"
ON public.stock_notifications FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Enable realtime for stock_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_notifications;

-- Create trigger for stock notification on low stock
CREATE OR REPLACE FUNCTION public.check_stock_and_notify()
RETURNS TRIGGER AS $$
DECLARE
  low_stock_threshold INTEGER := 10;
BEGIN
  -- Check if stock is low
  IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity <= low_stock_threshold AND NEW.stock_quantity > 0 THEN
    INSERT INTO public.stock_notifications (product_id, notification_type, message)
    VALUES (NEW.product_id, 'low_stock', 'Stock bas: ' || NEW.stock_quantity || ' unités restantes pour la taille ' || NEW.size)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check if out of stock
  IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity = 0 THEN
    INSERT INTO public.stock_notifications (product_id, product_size, notification_type, message)
    VALUES (NEW.product_id, NEW.size, 'out_of_stock', 'Rupture de stock pour la taille ' || NEW.size);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_check_stock_notification
AFTER UPDATE ON public.product_sizes
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION public.check_stock_and_notify();

-- Create updated_at triggers
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reorder_requests_updated_at
BEFORE UPDATE ON public.reorder_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();