-- Create storage bucket for guides media
INSERT INTO storage.buckets (id, name, public)
VALUES ('guides', 'guides', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for guides bucket
CREATE POLICY "Admins can upload guides media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'guides' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update guides media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'guides' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete guides media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'guides' AND is_admin_or_manager(auth.uid()));

CREATE POLICY "Anyone can view guides media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'guides');