-- Add EAN code, CNK code and coming soon flag to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS ean_code text DEFAULT '',
ADD COLUMN IF NOT EXISTS cnk_code text DEFAULT '',
ADD COLUMN IF NOT EXISTS is_coming_soon boolean DEFAULT false;

-- Add indexes for code lookups
CREATE INDEX IF NOT EXISTS idx_products_ean_code ON public.products(ean_code) WHERE ean_code != '';
CREATE INDEX IF NOT EXISTS idx_products_cnk_code ON public.products(cnk_code) WHERE cnk_code != '';