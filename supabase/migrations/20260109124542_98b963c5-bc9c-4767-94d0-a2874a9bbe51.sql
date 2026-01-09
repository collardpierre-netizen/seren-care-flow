-- Allow public read access to email-assets bucket
CREATE POLICY "Public read access for email-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'email-assets');