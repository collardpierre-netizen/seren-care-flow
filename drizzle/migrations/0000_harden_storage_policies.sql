-- 1) email-assets uploads were open to anyone (with_check only checked the bucket).
DROP POLICY IF EXISTS "Admins can upload email assets" ON storage.objects;
CREATE POLICY "Admins can upload email assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'email-assets' AND public.is_admin_or_manager(auth.uid()));

-- Also give staff update/delete control over email assets (previously none existed).
DROP POLICY IF EXISTS "Admins can update email assets" ON storage.objects;
CREATE POLICY "Admins can update email assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'email-assets' AND public.is_admin_or_manager(auth.uid()))
WITH CHECK (bucket_id = 'email-assets' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete email assets" ON storage.objects;
CREATE POLICY "Admins can delete email assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'email-assets' AND public.is_admin_or_manager(auth.uid()));

-- 2) Prevent anonymous enumeration (list()) of bucket contents.
--    The buckets stay public, so direct public object URLs keep working.
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view guides media" ON storage.objects;
DROP POLICY IF EXISTS "Email assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for email-assets" ON storage.objects;

CREATE POLICY "Authenticated users can list storage objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('media', 'guides', 'email-assets'));

-- 3) Tighten the remaining media/guides policies to authenticated only.
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.is_admin_or_manager(auth.uid()))
WITH CHECK (bucket_id = 'media' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload guides media" ON storage.objects;
CREATE POLICY "Admins can upload guides media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'guides' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can update guides media" ON storage.objects;
CREATE POLICY "Admins can update guides media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'guides' AND public.is_admin_or_manager(auth.uid()))
WITH CHECK (bucket_id = 'guides' AND public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete guides media" ON storage.objects;
CREATE POLICY "Admins can delete guides media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'guides' AND public.is_admin_or_manager(auth.uid()));