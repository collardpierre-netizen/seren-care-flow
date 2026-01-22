-- Table pour les emails programmés
CREATE TABLE public.scheduled_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_filter JSONB NOT NULL DEFAULT '{"status": "active"}'::jsonb,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT
);

-- Table pour le tracking des relances
CREATE TABLE public.subscription_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('paused_30d', 'paused_60d', 'reactivation')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_sent_to TEXT NOT NULL,
  UNIQUE(subscription_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_emails (admin only)
CREATE POLICY "Admins can manage scheduled emails"
ON public.scheduled_emails
FOR ALL
USING (is_admin_or_manager(auth.uid()));

-- RLS policies for subscription_reminders (admin only)
CREATE POLICY "Admins can view subscription reminders"
ON public.subscription_reminders
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Index pour les emails programmés en attente
CREATE INDEX idx_scheduled_emails_pending ON public.scheduled_emails(scheduled_at) 
WHERE status = 'pending';

-- Index pour les relances
CREATE INDEX idx_subscription_reminders_sub ON public.subscription_reminders(subscription_id);