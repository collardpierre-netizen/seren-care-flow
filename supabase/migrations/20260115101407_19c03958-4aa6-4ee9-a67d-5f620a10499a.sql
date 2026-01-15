-- ÉTAPE 2A: Ajouter les colonnes Stripe au profil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
ADD COLUMN IF NOT EXISTS is_member_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

-- ÉTAPE 2B: Table stripe_subscriptions (tracking détaillé des abonnements Stripe)
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe subscriptions" ON public.stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage stripe subscriptions" ON public.stripe_subscriptions
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- ÉTAPE 2C: Table stripe_orders (tracking des paiements one-shot)
CREATE TABLE IF NOT EXISTS public.stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_checkout_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  amount_total integer NOT NULL,
  currency text DEFAULT 'eur',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe orders" ON public.stripe_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage stripe orders" ON public.stripe_orders
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- ÉTAPE 2D: Table stripe_price_map (mapping produits SerenCare -> Prix Stripe récurrents)
CREATE TABLE IF NOT EXISTS public.stripe_price_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_size text,
  stripe_price_id text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'subscription' CHECK (type IN ('subscription', 'one_shot')),
  unit_amount integer NOT NULL,
  currency text DEFAULT 'eur',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, product_size, type)
);

ALTER TABLE public.stripe_price_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stripe prices" ON public.stripe_price_map
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stripe prices" ON public.stripe_price_map
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- ÉTAPE 2E: Table subscription_carts (panier récurrent distinct)
CREATE TABLE IF NOT EXISTS public.subscription_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscription_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscription cart" ON public.subscription_carts
  FOR ALL USING (auth.uid() = user_id);

-- ÉTAPE 2F: Table subscription_cart_items
CREATE TABLE IF NOT EXISTS public.subscription_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.subscription_carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_size text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cart_id, product_id, product_size)
);

ALTER TABLE public.subscription_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscription cart items" ON public.subscription_cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.subscription_carts 
      WHERE subscription_carts.id = subscription_cart_items.cart_id 
      AND subscription_carts.user_id = auth.uid()
    )
  );

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user ON public.stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON public.stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user ON public.stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_price_map_product ON public.stripe_price_map(product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_cart_items_cart ON public.subscription_cart_items(cart_id);

-- Trigger pour updated_at sur stripe_subscriptions
CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON public.stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur subscription_carts
CREATE TRIGGER update_subscription_carts_updated_at
  BEFORE UPDATE ON public.subscription_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur stripe_price_map
CREATE TRIGGER update_stripe_price_map_updated_at
  BEFORE UPDATE ON public.stripe_price_map
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();