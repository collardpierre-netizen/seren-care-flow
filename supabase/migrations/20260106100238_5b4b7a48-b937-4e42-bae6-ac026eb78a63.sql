-- Create guides table for SEO articles
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  read_time TEXT,
  is_published BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Anyone can view published guides
CREATE POLICY "Anyone can view published guides"
ON public.guides
FOR SELECT
USING (is_published = true);

-- Admins can manage all guides
CREATE POLICY "Admins can manage guides"
ON public.guides
FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_guides_updated_at
BEFORE UPDATE ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();