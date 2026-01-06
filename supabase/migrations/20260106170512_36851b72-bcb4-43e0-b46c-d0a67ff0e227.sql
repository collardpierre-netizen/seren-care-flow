-- ======================================
-- MIGRATION: Suivi de commande Uber Eats style
-- ======================================

-- 1. Supprimer le default AVANT de changer le type
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- 2. Modifier la colonne status de orders pour utiliser text temporairement
ALTER TABLE orders ALTER COLUMN status TYPE text USING status::text;

-- Convertir les anciens statuts vers les nouveaux
UPDATE orders SET status = 'order_received' WHERE status = 'pending';
UPDATE orders SET status = 'payment_confirmed' WHERE status = 'paid';
-- shipped, delivered, cancelled restent identiques

-- 3. Drop l'ancien type
DROP TYPE IF EXISTS order_status;

-- 4. Créer le nouvel enum avec tous les statuts
CREATE TYPE order_status AS ENUM (
  'order_received',
  'payment_confirmed', 
  'processing',
  'preparing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'closed',
  'on_hold',
  'delayed',
  'partially_shipped',
  'cancelled',
  'returned',
  'refunded'
);

-- 5. Convertir vers le nouveau type avec default
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'order_received'::order_status;

-- 6. Ajouter colonnes manquantes à orders
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS eta_date date,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- 7. Renommer et enrichir order_status_history -> order_status_events  
ALTER TABLE order_status_history RENAME TO order_status_events;

-- Renommer les colonnes existantes pour correspondre au nouveau schéma
ALTER TABLE order_status_events RENAME COLUMN notes TO message_public;
ALTER TABLE order_status_events RENAME COLUMN changed_by TO created_by;

-- Ajouter les nouvelles colonnes
ALTER TABLE order_status_events 
  ADD COLUMN IF NOT EXISTS message_internal text,
  ADD COLUMN IF NOT EXISTS is_visible_to_customer boolean DEFAULT true;

-- 8. Créer la table notification_outbox
CREATE TABLE IF NOT EXISTS notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  template text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

-- Indexes pour notification_outbox
CREATE INDEX IF NOT EXISTS idx_notification_outbox_status ON notification_outbox(status);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_order ON notification_outbox(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_user ON notification_outbox(user_id);

-- 9. RLS pour notification_outbox
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications"
  ON notification_outbox FOR ALL
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can view own notifications"
  ON notification_outbox FOR SELECT
  USING (user_id = auth.uid());

-- 10. Mettre à jour les politiques de order_status_events (renommée)
DROP POLICY IF EXISTS "Admins can manage order history" ON order_status_events;
DROP POLICY IF EXISTS "Users can view their own order history" ON order_status_events;

CREATE POLICY "Admins can manage order events"
  ON order_status_events FOR ALL
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can view their own order events"
  ON order_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_events.order_id
      AND orders.user_id = auth.uid()
    )
    AND is_visible_to_customer = true
  );

-- 11. Table des transitions autorisées
CREATE TABLE IF NOT EXISTS order_status_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_status text NOT NULL,
  to_status text NOT NULL,
  is_exception boolean DEFAULT false,
  description text,
  UNIQUE(from_status, to_status)
);

-- Insérer les transitions normales
INSERT INTO order_status_transitions (from_status, to_status, is_exception, description) VALUES
  ('order_received', 'payment_confirmed', false, 'Paiement confirmé'),
  ('payment_confirmed', 'processing', false, 'Prise en charge'),
  ('processing', 'preparing', false, 'Début préparation'),
  ('preparing', 'packed', false, 'Colis prêt'),
  ('packed', 'shipped', false, 'Expédition'),
  ('shipped', 'out_for_delivery', false, 'En livraison'),
  ('out_for_delivery', 'delivered', false, 'Livré'),
  ('shipped', 'delivered', false, 'Livré directement'),
  ('delivered', 'closed', false, 'Clôture'),
  -- Exceptions
  ('order_received', 'on_hold', true, 'Mise en attente'),
  ('payment_confirmed', 'on_hold', true, 'Mise en attente'),
  ('processing', 'on_hold', true, 'Mise en attente'),
  ('preparing', 'on_hold', true, 'Mise en attente'),
  ('packed', 'on_hold', true, 'Mise en attente'),
  ('on_hold', 'processing', true, 'Reprise du traitement'),
  ('preparing', 'delayed', true, 'Retard préparation'),
  ('packed', 'delayed', true, 'Retard expédition'),
  ('shipped', 'delayed', true, 'Retard livraison'),
  ('delayed', 'preparing', true, 'Reprise préparation'),
  ('delayed', 'shipped', true, 'Reprise expédition'),
  ('order_received', 'cancelled', true, 'Annulation'),
  ('payment_confirmed', 'cancelled', true, 'Annulation'),
  ('processing', 'cancelled', true, 'Annulation'),
  ('preparing', 'cancelled', true, 'Annulation'),
  ('packed', 'cancelled', true, 'Annulation'),
  ('shipped', 'returned', true, 'Retour'),
  ('delivered', 'returned', true, 'Retour'),
  ('cancelled', 'refunded', true, 'Remboursement'),
  ('returned', 'refunded', true, 'Remboursement')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- RLS pour transitions (lecture publique pour le front)
ALTER TABLE order_status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transitions"
  ON order_status_transitions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage transitions"
  ON order_status_transitions FOR ALL
  USING (is_admin_or_manager(auth.uid()));

-- 12. Créer la fonction RPC set_order_status
CREATE OR REPLACE FUNCTION public.set_order_status(
  p_order_id uuid,
  p_new_status text,
  p_message_public text DEFAULT NULL,
  p_message_internal text DEFAULT NULL,
  p_eta_date date DEFAULT NULL,
  p_tracking_number text DEFAULT NULL,
  p_tracking_url text DEFAULT NULL,
  p_carrier text DEFAULT NULL,
  p_notify_customer boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_current_status text;
  v_transition_allowed boolean;
  v_user_id uuid;
  v_event_id uuid;
  v_default_message text;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission refusée';
  END IF;

  -- Récupérer la commande
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande introuvable';
  END IF;

  v_current_status := v_order.status::text;
  v_user_id := v_order.user_id;

  -- Vérifier la transition
  SELECT EXISTS (
    SELECT 1 FROM order_status_transitions
    WHERE from_status = v_current_status
    AND to_status = p_new_status
  ) INTO v_transition_allowed;

  IF NOT v_transition_allowed THEN
    RAISE EXCEPTION 'Transition non autorisée de % vers %', v_current_status, p_new_status;
  END IF;

  -- Message par défaut selon le statut
  v_default_message := CASE p_new_status
    WHEN 'order_received' THEN 'Nous avons bien reçu votre commande.'
    WHEN 'payment_confirmed' THEN 'Votre paiement est confirmé. Nous lançons la préparation.'
    WHEN 'processing' THEN 'Votre commande est prise en charge par notre centre de préparation.'
    WHEN 'preparing' THEN 'Nos équipes préparent soigneusement votre colis.'
    WHEN 'packed' THEN 'Votre colis est prêt et attend le transporteur.'
    WHEN 'shipped' THEN 'Votre colis est expédié. Vous pouvez suivre l''acheminement.'
    WHEN 'out_for_delivery' THEN 'Votre colis est en cours de livraison.'
    WHEN 'delivered' THEN 'Votre commande a été livrée.'
    WHEN 'closed' THEN 'Commande terminée. Merci pour votre confiance.'
    WHEN 'on_hold' THEN 'Votre commande est en attente d''informations complémentaires.'
    WHEN 'delayed' THEN 'Votre commande a pris du retard. Nous faisons le maximum.'
    WHEN 'cancelled' THEN 'Votre commande a été annulée.'
    WHEN 'returned' THEN 'Votre retour a bien été pris en compte.'
    WHEN 'refunded' THEN 'Votre remboursement a été effectué.'
    ELSE 'Mise à jour de votre commande.'
  END;

  -- Mettre à jour la commande
  UPDATE orders SET
    status = p_new_status::order_status,
    eta_date = COALESCE(p_eta_date, eta_date),
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    tracking_url = COALESCE(p_tracking_url, tracking_url),
    carrier = COALESCE(p_carrier, carrier),
    updated_at = now()
  WHERE id = p_order_id;

  -- Créer l'événement de statut
  INSERT INTO order_status_events (
    order_id,
    status,
    message_public,
    message_internal,
    created_by,
    is_visible_to_customer
  ) VALUES (
    p_order_id,
    p_new_status,
    COALESCE(p_message_public, v_default_message),
    p_message_internal,
    auth.uid(),
    p_new_status NOT IN ('on_hold') -- Masquer certains statuts internes
  )
  RETURNING id INTO v_event_id;

  -- Créer la notification si demandé
  IF p_notify_customer AND v_user_id IS NOT NULL THEN
    INSERT INTO notification_outbox (
      user_id,
      order_id,
      channel,
      template,
      payload_json
    ) VALUES (
      v_user_id,
      p_order_id,
      'email',
      'status_changed_' || p_new_status,
      jsonb_build_object(
        'order_number', v_order.order_number,
        'new_status', p_new_status,
        'message', COALESCE(p_message_public, v_default_message),
        'tracking_number', COALESCE(p_tracking_number, v_order.tracking_number),
        'tracking_url', COALESCE(p_tracking_url, v_order.tracking_url),
        'carrier', COALESCE(p_carrier, v_order.carrier),
        'eta_date', p_eta_date::text
      )
    );
  END IF;

  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'new_status', p_new_status,
    'event_id', v_event_id
  );
END;
$$;

-- 13. Fonction pour créer un événement initial à la création de commande
CREATE OR REPLACE FUNCTION public.create_initial_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO order_status_events (
    order_id,
    status,
    message_public,
    is_visible_to_customer
  ) VALUES (
    NEW.id,
    NEW.status::text,
    'Nous avons bien reçu votre commande.',
    true
  );
  RETURN NEW;
END;
$$;

-- Créer le trigger pour les nouvelles commandes
DROP TRIGGER IF EXISTS trigger_create_initial_order_event ON orders;
CREATE TRIGGER trigger_create_initial_order_event
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_order_event();

-- 14. Migrer les anciennes commandes sans events
INSERT INTO order_status_events (order_id, status, message_public, created_at, is_visible_to_customer)
SELECT 
  o.id,
  o.status::text,
  'Commande créée',
  o.created_at,
  true
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM order_status_events e WHERE e.order_id = o.id
);

-- 15. Activer Realtime sur orders et order_status_events
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_events;