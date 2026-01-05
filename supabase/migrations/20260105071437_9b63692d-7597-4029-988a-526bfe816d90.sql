-- Add new pricing and inventory fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS recommended_price numeric,
ADD COLUMN IF NOT EXISTS purchase_price numeric,
ADD COLUMN IF NOT EXISTS units_per_product integer DEFAULT 1;

-- Add comment for purchase_price to indicate it's internal/admin only
COMMENT ON COLUMN public.products.purchase_price IS 'Internal use only - purchase cost for margin calculation';