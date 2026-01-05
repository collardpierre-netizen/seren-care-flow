-- Create table for hero media management
CREATE TABLE public.hero_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  display_duration INTEGER DEFAULT 6000, -- Duration in ms for images (videos play full length)
  transition_effect TEXT DEFAULT 'fade' CHECK (transition_effect IN ('fade', 'zoom', 'slide')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;

-- Public read access (hero is public)
CREATE POLICY "Hero media is publicly viewable"
ON public.hero_media
FOR SELECT
USING (is_active = true);

-- Admin/manager can manage
CREATE POLICY "Admins can manage hero media"
ON public.hero_media
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_hero_media_updated_at
BEFORE UPDATE ON public.hero_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default media from current setup
INSERT INTO public.hero_media (type, file_url, alt_text, sort_order, display_duration, transition_effect) VALUES
('video', '/hero-video.mov', 'Vidéo SerenCare', 0, NULL, 'fade'),
('image', '/hero-1.jpeg', 'SerenCare - Accompagnement seniors', 1, 6000, 'fade'),
('video', '/hero-video-2.mov', 'Nouvelle vidéo SerenCare', 2, NULL, 'fade'),
('image', '/hero-2.jpeg', 'SerenCare - Livraison à domicile', 3, 6000, 'fade');