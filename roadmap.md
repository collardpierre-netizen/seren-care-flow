# Roadmap sécurité

- [x] Phase 1 : RLS order_messages + cart_items, verify-payment / create-checkout
- [x] Auth des fonctions e-mail (JWT ou secret interne)
- [x] Validation zod : create-order, create-user, preparer-message
- [x] Protection des mots de passe compromis (HIBP)
- [x] Politiques de stockage durcies (upload email-assets, listage)
- [x] stock_alerts / order_preparer_logs / preparer_earned_badges
- [x] E-mails des auteurs d'avis masqués au public

## À valider par l'utilisateur (non modifié)
- Notes internes des commandes : garde-fou base de données à ajouter ?
- Canaux temps réel privés : politiques par sujet ?
- Fonctions SECURITY DEFINER exécutables publiquement (avertissement générique)
