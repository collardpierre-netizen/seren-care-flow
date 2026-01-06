-- Add stock status to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_status TEXT NOT NULL DEFAULT 'in_stock';

-- Add stock alert subscriptions table
CREATE TABLE public.stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for stock_alerts
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can create stock alerts
CREATE POLICY "Anyone can create stock alerts"
ON public.stock_alerts FOR INSERT
WITH CHECK (true);

-- Admins can manage stock alerts
CREATE POLICY "Admins can manage stock alerts"
ON public.stock_alerts FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Users can view their own alerts (by email match with profile)
CREATE POLICY "Users can view own stock alerts"
ON public.stock_alerts FOR SELECT
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for product_reviews  
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.product_reviews FOR SELECT
USING (is_approved = true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own pending reviews
CREATE POLICY "Users can update own pending reviews"
ON public.product_reviews FOR UPDATE
USING (auth.uid() = user_id AND is_approved = false);

-- Users can delete their own pending reviews
CREATE POLICY "Users can delete own pending reviews"
ON public.product_reviews FOR DELETE
USING (auth.uid() = user_id AND is_approved = false);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved);
CREATE INDEX idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_email ON public.stock_alerts(email);