-- Add multi-value tag columns for product filtering
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS mobility_levels text DEFAULT '',
ADD COLUMN IF NOT EXISTS usage_times text DEFAULT '',
ADD COLUMN IF NOT EXISTS gender text DEFAULT '';

-- Create index for better filter performance
CREATE INDEX IF NOT EXISTS idx_products_mobility_levels ON public.products USING gin(to_tsvector('simple', mobility_levels));
CREATE INDEX IF NOT EXISTS idx_products_usage_times ON public.products USING gin(to_tsvector('simple', usage_times));
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products USING gin(to_tsvector('simple', gender));