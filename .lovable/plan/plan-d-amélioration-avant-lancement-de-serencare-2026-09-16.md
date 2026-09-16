# Plan d’amélioration avant lancement de SerenCare

## Objectif
Rendre les parcours d’achat plus crédibles, compréhensibles et accessibles, sans inventer de preuve sociale ni modifier les produits, les intégrations ou la structure de la base de données.

## Modifications prévues

### 1. Accueil et positionnement
- Remplacer le premier écran par les textes, les deux actions et le lien téléphonique fournis.
- Conserver les médias actuels, mais réduire leur animation et garantir la visibilité du titre et des actions sur mobile.
- Ajouter « Comment souhaitez-vous commander ? » avec trois cartes entièrement cliquables. Le parcours « pour un proche » pointera vers la nouvelle section explicative de l’accueil.
- Remplacer « Simple comme bonjour » par les quatre étapes demandées.
- Supprimer entièrement les faux avis, étoiles, note et chiffres clients ; les remplacer par « Pourquoi SerenCare a été créé » et les quatre bénéfices factuels.
- Réécrire « Pourquoi SerenCare ? » et la présentation des marques avec les formulations factuelles fournies.
- Mettre à jour le titre et la description de la page d’accueil.

### 2. Promesses commerciales cohérentes
- Uniformiser les textes visibles sur « Livraison gratuite dès 69 € TTC ».
- Corriger la donnée de réglage existante du seuil de livraison gratuite de 49 € à 69 € afin que l’affichage et le calcul du panier concordent, sans changement de schéma.
- Remplacer les promesses de livraison en 24/48 h ou « express » par des délais estimés calculés ou une formulation prudente.
- Corriger les occurrences concernées sur l’accueil, la boutique, les fiches produit, le panier, la commande, les pages informatives et les composants partagés.
- Ne pas toucher aux délais de réponse des formulaires ou partenariats lorsqu’ils ne parlent pas de livraison.

### 3. Achat unique et livraison régulière
- Faire de « Achat unique » le choix initial sur les fiches produit et l’aperçu rapide.
- N’afficher la livraison régulière que pour les produits réellement éligibles.
- Afficher clairement le prix par livraison, la réduction réellement enregistrée, la fréquence, la prochaine période estimée, l’absence de durée minimale et la gestion depuis « Mon compte ».
- Reprendre ces informations dans le panier et avant paiement, sans modifier le moteur d’abonnement ni les paiements.
- Remplacer le titre de présentation de l’abonnement et son texte par ceux fournis.
- Ne conserver les mentions de 10 % que là où le prix réduit est effectivement présent et calculé ; supprimer les valeurs de repli artificielles.

### 4. Boutique et cartes produits
- Utiliser une seule colonne à 320–375 px, puis une grille progressive aux largeurs supérieures.
- Afficher sans troncature problématique la marque, le nom, la catégorie/type, la taille, les unités, le prix TTC, le prix unitaire et la disponibilité lorsqu’ils existent.
- Ajouter une action explicite « Voir le produit » et conserver les champs absents masqués.
- Mettre le texte exact dans la recherche et relier le bouton d’aide à `/aide-au-choix`.
- Garder uniquement des filtres fondés sur les données présentes : marque, catégorie/type, taille, niveau/usage et disponibilité de la livraison régulière.
- Remplacer les menus au survol non accessibles au clavier par des contrôles utilisables au clavier et au toucher.

### 5. Fiches produit et parcours panier
- Réordonner la fiche selon la séquence demandée, sans inventer de description ni de caractéristique.
- Ajouter les deux messages d’aide près de la taille et de l’achat.
- Remplacer les promesses non vérifiées (« livraison express », efficacité, etc.) par des libellés factuels.
- Conserver les photos, variantes, quantités, prix unitaires, disponibilité, panier et alertes existants.
- Clarifier chaque ligne du panier et du récapitulatif avec « Achat unique » ou « Livraison régulière » et les informations récurrentes disponibles.
- Conserver l’adresse de livraison dans SerenCare et la collecte d’une adresse de facturation différente sur la page de paiement sécurisée existante.

### 6. Contact, cookies et pied de page
- Ajouter au formulaire de rappel l’avertissement médical et une case obligatoire, non cochée, liée à la politique de confidentialité.
- Appliquer le même consentement explicite aux formulaires de rappel partagés afin qu’aucun point d’entrée ne le contourne.
- Conserver toutes les données saisies lors d’une erreur ; afficher une confirmation claire après succès.
- Vérifier que le message n’est envoyé à aucun outil publicitaire ; aucun nouvel outil de suivi ne sera ajouté.
- Rendre les trois choix de cookies équivalents et compacts sur mobile.
- Bloquer le chargement Analytics avant consentement, permettre son activation après accord et ajouter « Gérer mes cookies » au pied de page.

### 7. Accessibilité et validation
- Corriger les H1 multiples ou manquants, l’ordre H2/H3, les labels, noms accessibles, zones tactiles de 44 px, focus visibles, textes alternatifs et débordements horizontaux sur les pages modifiées.
- Corriger l’avertissement console actuel du média d’accueil.
- Ajouter des tests ciblés pour les textes interdits, le choix initial « Achat unique », la cohérence du seuil, le consentement cookies et la recherche boutique.
- Vérifier à 320, 375, 768, 1024 et 1440 px : accueil, boutique, fiche produit, panier, commande, connexion, inscription, compte, contact et pages légales.
- Tester les navigations, recherche/filtres, variante/quantité, ajout/modification/suppression panier, persistance au retour, achat unique, livraison régulière si disponible, authentification et formulaires.
- Ouvrir le paiement en mode test sans effectuer de transaction réelle.

## Détails techniques
- Réutiliser les composants, couleurs et composants de formulaire existants.
- Aucun produit ne sera supprimé ou modifié.
- Aucun changement de schéma, de clé, de webhook ou d’intégration.
- Seule la valeur existante du seuil de livraison gratuite sera alignée à 69 € pour éviter un calcul de panier contradictoire.
- Les affirmations impossibles à confirmer seront retirées ou reformulées, et non remplacées par de nouvelles promesses.

## Livrable final
- Rapport exact des fichiers modifiés.
- Liste des corrections appliquées.
- Tests exécutés et résultats.
- Éléments volontairement non modifiés.
- Informations encore nécessaires du propriétaire.
- Pages précises à vérifier manuellement.
