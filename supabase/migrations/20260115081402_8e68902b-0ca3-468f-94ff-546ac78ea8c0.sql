-- Function to notify stock alerts when product becomes available
CREATE OR REPLACE FUNCTION public.notify_stock_alerts_on_restock()
RETURNS TRIGGER AS $$
DECLARE
  was_out_of_stock BOOLEAN;
  is_now_in_stock BOOLEAN;
  product_record RECORD;
BEGIN
  -- Check if product was out of stock and is now in stock
  was_out_of_stock := (OLD.stock_quantity IS NULL OR OLD.stock_quantity = 0) 
                      OR (OLD.is_coming_soon = true);
  is_now_in_stock := (NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity > 0) 
                     AND (NEW.is_coming_soon = false OR NEW.is_coming_soon IS NULL);
  
  -- Also check for is_coming_soon transition
  IF (OLD.is_coming_soon = true AND (NEW.is_coming_soon = false OR NEW.is_coming_soon IS NULL)) THEN
    was_out_of_stock := true;
    is_now_in_stock := true;
  END IF;
  
  -- If transitioning from out of stock to in stock, create notification
  IF was_out_of_stock AND is_now_in_stock THEN
    INSERT INTO public.stock_notifications (
      product_id, 
      notification_type, 
      message
    )
    VALUES (
      NEW.id, 
      'back_in_stock', 
      'Le produit ' || NEW.name || ' est de nouveau disponible. Des alertes clients sont en attente.'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger on products table
DROP TRIGGER IF EXISTS trigger_notify_stock_alerts ON public.products;
CREATE TRIGGER trigger_notify_stock_alerts
AFTER UPDATE ON public.products
FOR EACH ROW
WHEN (
  (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  OR (OLD.is_coming_soon IS DISTINCT FROM NEW.is_coming_soon)
  OR (OLD.stock_status IS DISTINCT FROM NEW.stock_status)
)
EXECUTE FUNCTION public.notify_stock_alerts_on_restock();

-- Similar function for product_sizes table
CREATE OR REPLACE FUNCTION public.notify_size_stock_alerts_on_restock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if size was out of stock and is now in stock
  IF (OLD.stock_quantity IS NULL OR OLD.stock_quantity = 0) 
     AND (NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity > 0) THEN
    INSERT INTO public.stock_notifications (
      product_id,
      product_size,
      notification_type, 
      message
    )
    VALUES (
      NEW.product_id,
      NEW.size,
      'size_back_in_stock', 
      'La taille ' || NEW.size || ' est de nouveau disponible. Des alertes clients sont en attente.'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger on product_sizes table
DROP TRIGGER IF EXISTS trigger_notify_size_stock_alerts ON public.product_sizes;
CREATE TRIGGER trigger_notify_size_stock_alerts
AFTER UPDATE ON public.product_sizes
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION public.notify_size_stock_alerts_on_restock();

-- Add RLS policy for stock_alerts to allow anonymous inserts
DROP POLICY IF EXISTS "Anyone can create stock alerts" ON public.stock_alerts;
CREATE POLICY "Anyone can create stock alerts" 
ON public.stock_alerts 
FOR INSERT 
WITH CHECK (true);

-- Allow service role to read and update
DROP POLICY IF EXISTS "Service role can manage stock alerts" ON public.stock_alerts;
CREATE POLICY "Service role can manage stock alerts" 
ON public.stock_alerts 
FOR ALL 
USING (true);

-- Enable RLS if not already
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;