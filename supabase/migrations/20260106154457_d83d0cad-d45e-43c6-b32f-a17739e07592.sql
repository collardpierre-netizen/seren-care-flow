-- Table pour l'historique des statuts de commande
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  notification_sent BOOLEAN DEFAULT false,
  notification_type TEXT, -- 'email', 'sms', 'whatsapp'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own order history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage order history"
ON public.order_status_history
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));

-- Ajouter colonnes suivi transporteur à orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Table pour les tokens d'accès préparateur
CREATE TABLE public.order_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX idx_order_access_tokens_token ON public.order_access_tokens(token);
CREATE INDEX idx_order_access_tokens_order_id ON public.order_access_tokens(order_id);

-- RLS pour access tokens (accessible publiquement en lecture pour vérification)
ALTER TABLE public.order_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can verify tokens"
ON public.order_access_tokens
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage access tokens"
ON public.order_access_tokens
FOR ALL
USING (public.is_admin_or_manager(auth.uid()));