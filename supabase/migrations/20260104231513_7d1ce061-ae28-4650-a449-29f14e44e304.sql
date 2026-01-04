-- Create callback_requests table for storing callback form submissions
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_day TEXT,
  preferred_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit callback request"
ON public.callback_requests
FOR INSERT
WITH CHECK (true);

-- Only admins/managers can view callback requests
CREATE POLICY "Admins can view callback requests"
ON public.callback_requests
FOR SELECT
USING (public.is_admin_or_manager(auth.uid()));

-- Only admins/managers can update callback requests
CREATE POLICY "Admins can update callback requests"
ON public.callback_requests
FOR UPDATE
USING (public.is_admin_or_manager(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_callback_requests_updated_at
BEFORE UPDATE ON public.callback_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();