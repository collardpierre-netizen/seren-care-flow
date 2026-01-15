-- Add used_at column to track one-time use of magic links
ALTER TABLE public.order_access_tokens 
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_access_tokens_token ON public.order_access_tokens(token);

-- Comment explaining the new flow
COMMENT ON COLUMN public.order_access_tokens.used_at IS 'Timestamp when the magic link was used - once set, the token cannot be reused';