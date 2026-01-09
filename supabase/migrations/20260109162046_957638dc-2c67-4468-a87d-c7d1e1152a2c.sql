-- Add sale_price and purchase_price columns to product_sizes table
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS sale_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS purchase_price numeric DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.product_sizes.sale_price IS 'Override sale price for this size (if different from base product price + adjustment)';
COMMENT ON COLUMN public.product_sizes.purchase_price IS 'Purchase price for this specific size variant';
COMMENT ON COLUMN public.product_sizes.sku IS 'Unique SKU reference for this size variant';