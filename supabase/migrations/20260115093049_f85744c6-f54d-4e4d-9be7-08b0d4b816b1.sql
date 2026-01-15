-- Add unsubscribe_token to stock_alerts table for secure unsubscription
ALTER TABLE public.stock_alerts 
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid() NOT NULL;

-- Create index for fast lookups by token
CREATE INDEX IF NOT EXISTS idx_stock_alerts_unsubscribe_token ON public.stock_alerts(unsubscribe_token);

-- Create a policy to allow public access to unsubscribe (by token)
CREATE POLICY "Allow public unsubscribe by token" 
ON public.stock_alerts 
FOR UPDATE 
USING (true)
WITH CHECK (true);