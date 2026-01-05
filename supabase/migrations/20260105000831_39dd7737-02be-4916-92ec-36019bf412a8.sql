-- Create table for partner/prescriber applications
CREATE TABLE public.prescriber_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Applicant info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Professional info
  organization_name TEXT,
  organization_type TEXT NOT NULL, -- 'institution', 'doctor', 'nurse', 'other'
  job_title TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  
  -- Application details
  patient_count TEXT, -- estimated number of patients
  message TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'approved', 'rejected'
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.prescriber_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit prescriber application"
ON public.prescriber_applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Admins can view prescriber applications"
ON public.prescriber_applications
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Only admins can update applications
CREATE POLICY "Admins can update prescriber applications"
ON public.prescriber_applications
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_prescriber_applications_updated_at
BEFORE UPDATE ON public.prescriber_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();