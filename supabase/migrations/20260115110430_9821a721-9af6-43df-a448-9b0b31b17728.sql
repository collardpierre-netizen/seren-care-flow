-- Nettoyer les doublons existants en gardant le plus récent
DELETE FROM subscription_cart_items a
USING subscription_cart_items b
WHERE a.cart_id = b.cart_id 
  AND a.product_id = b.product_id 
  AND COALESCE(a.product_size, '') = COALESCE(b.product_size, '')
  AND a.created_at < b.created_at;

-- Ajouter la contrainte unique
ALTER TABLE subscription_cart_items 
ADD CONSTRAINT subscription_cart_items_cart_product_size_unique 
UNIQUE (cart_id, product_id, product_size);