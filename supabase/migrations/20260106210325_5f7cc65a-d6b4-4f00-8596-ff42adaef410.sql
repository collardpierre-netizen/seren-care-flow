-- Add show_size_guide column to products table
ALTER TABLE public.products 
ADD COLUMN show_size_guide boolean NOT NULL DEFAULT true;