-- Add manufacturer URL field to products table
ALTER TABLE public.products 
ADD COLUMN manufacturer_url TEXT;