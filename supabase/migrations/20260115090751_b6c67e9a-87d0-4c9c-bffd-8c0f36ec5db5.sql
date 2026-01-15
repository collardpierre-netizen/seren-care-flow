-- Create a database webhook to automatically call the auto-stock-alert edge function
-- when a back_in_stock or size_back_in_stock notification is created

-- First, create or update the trigger function to call the edge function via pg_net
CREATE OR REPLACE FUNCTION public.auto_send_stock_alerts()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only process back_in_stock and size_back_in_stock notifications
  IF NEW.notification_type NOT IN ('back_in_stock', 'size_back_in_stock') THEN
    RETURN NEW;
  END IF;

  -- Build the edge function URL
  edge_function_url := 'https://obkfkygjisxvgrmclhnb.supabase.co/functions/v1/auto-stock-alert';
  
  -- Get the service role key from vault if available, otherwise we'll use a direct call
  -- For now, we use a simpler approach: insert into notification_outbox for processing
  
  -- Instead of HTTP call, we'll use the notification_outbox pattern
  -- This is more reliable and doesn't require pg_net extension
  INSERT INTO public.notification_outbox (
    channel,
    template,
    order_id,
    payload_json,
    status
  ) VALUES (
    'stock_alert',
    'auto_stock_alert',
    NULL,
    jsonb_build_object(
      'notification_id', NEW.id,
      'product_id', NEW.product_id,
      'product_size', NEW.product_size,
      'notification_type', NEW.notification_type
    ),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on stock_notifications table
DROP TRIGGER IF EXISTS trigger_auto_send_stock_alerts ON public.stock_notifications;

CREATE TRIGGER trigger_auto_send_stock_alerts
  AFTER INSERT ON public.stock_notifications
  FOR EACH ROW
  WHEN (NEW.notification_type IN ('back_in_stock', 'size_back_in_stock'))
  EXECUTE FUNCTION public.auto_send_stock_alerts();

-- Enable pg_net extension for HTTP calls from database (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Now create a better trigger that directly calls the edge function
CREATE OR REPLACE FUNCTION public.call_auto_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process back_in_stock and size_back_in_stock notifications
  IF NEW.notification_type NOT IN ('back_in_stock', 'size_back_in_stock') THEN
    RETURN NEW;
  END IF;

  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := 'https://obkfkygjisxvgrmclhnb.supabase.co/functions/v1/auto-stock-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'stock_notifications',
      'record', jsonb_build_object(
        'id', NEW.id,
        'product_id', NEW.product_id,
        'product_size', NEW.product_size,
        'notification_type', NEW.notification_type,
        'message', NEW.message,
        'created_at', NEW.created_at
      )
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE WARNING 'Failed to call auto-stock-alert: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the previous trigger and create the new one
DROP TRIGGER IF EXISTS trigger_auto_send_stock_alerts ON public.stock_notifications;

CREATE TRIGGER trigger_auto_send_stock_alerts
  AFTER INSERT ON public.stock_notifications
  FOR EACH ROW
  WHEN (NEW.notification_type IN ('back_in_stock', 'size_back_in_stock'))
  EXECUTE FUNCTION public.call_auto_stock_alert();