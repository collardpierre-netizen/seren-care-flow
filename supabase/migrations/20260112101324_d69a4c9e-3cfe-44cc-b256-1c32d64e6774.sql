-- Add missing columns to product_sizes table for variant management
ALTER TABLE public.product_sizes 
ADD COLUMN IF NOT EXISTS ean_code text,
ADD COLUMN IF NOT EXISTS cnk_code text,
ADD COLUMN IF NOT EXISTS units_per_size integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS public_price numeric;