-- Create prescriber referral system tables

-- Prescribers table (linked to users or standalone)
CREATE TABLE public.prescribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('nurse', 'doctor', 'pharmacy', 'nursing_home')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  address TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescribers ENABLE ROW LEVEL SECURITY;

-- Prescribers can view their own profile
CREATE POLICY "Prescribers can view own profile"
ON public.prescribers
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all prescribers
CREATE POLICY "Admins can manage prescribers"
ON public.prescribers
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_prescribers_updated_at
BEFORE UPDATE ON public.prescribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Commission ledger
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescriber_id UUID NOT NULL REFERENCES public.prescribers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payable', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Prescribers can view their own commissions
CREATE POLICY "Prescribers can view own commissions"
ON public.commissions
FOR SELECT
USING (
  prescriber_id IN (
    SELECT id FROM public.prescribers WHERE user_id = auth.uid()
  )
);

-- Admins can manage all commissions
CREATE POLICY "Admins can manage commissions"
ON public.commissions
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Add referral_code column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS prescriber_id UUID REFERENCES public.prescribers(id);

-- Add referral_code column to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS prescriber_id UUID REFERENCES public.prescribers(id);

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_prescribers_referral_code ON public.prescribers(referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_prescriber ON public.orders(prescriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_prescriber ON public.subscriptions(prescriber_id);
CREATE INDEX IF NOT EXISTS idx_commissions_prescriber ON public.commissions(prescriber_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);