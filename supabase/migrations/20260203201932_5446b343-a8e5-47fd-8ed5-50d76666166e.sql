-- Enable RLS on callback_requests table (if not already enabled)
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to ensure clean state)
DROP POLICY IF EXISTS "Admins can view callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Admins can update callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Admins can delete callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Anyone can create callback requests" ON public.callback_requests;

-- Allow anyone to INSERT (public form submissions)
CREATE POLICY "Anyone can create callback requests" 
ON public.callback_requests 
FOR INSERT 
WITH CHECK (true);

-- Only admins can SELECT callback requests
CREATE POLICY "Admins can view callback requests" 
ON public.callback_requests 
FOR SELECT 
USING (public.is_admin_or_manager(auth.uid()));

-- Only admins can UPDATE callback requests
CREATE POLICY "Admins can update callback requests" 
ON public.callback_requests 
FOR UPDATE 
USING (public.is_admin_or_manager(auth.uid()));

-- Only admins can DELETE callback requests
CREATE POLICY "Admins can delete callback requests" 
ON public.callback_requests 
FOR DELETE 
USING (public.is_admin_or_manager(auth.uid()));