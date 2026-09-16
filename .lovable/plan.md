# Boutique plus simple : trois chemins d'entrée

## 1. Ce que j'ai trouvé dans le catalogue (à valider avant toute correction)

Je ne change aucun prix ni aucune donnée médicale. Voici ce qui semble anormal.

**Prix probablement erronés**
- TENA ProSkin Slip Super Medium 28 pièces : **142,55 €**, alors que la taille Large 28 pièces est à 27,76 €.
- MoliCare Premium Mobile Large 10 gouttes 14 pièces : **100 €**, alors que la version 6 gouttes 14 pièces est à 53,17 €.
- MoliCare Premium Elastic XL 10 gouttes 14 pièces : **100 €**, alors que la version 9 gouttes 14 pièces est à 29,53 €.
- MoliCare Premium Men pad 2 gouttes 14 pièces : **53,43 €**, très au-dessus des autres protections masculines.
- MoliCare Premium Mobile Large 6 gouttes 14 pièces : 53,17 €, à vérifier aussi.

**Conditionnements douteux**
- 13 produits ont « 1pc » dans leur nom mais coûtent 23 à 27 € (par exemple MoliCare Elastic L 9 gouttes). Un paquet a probablement été enregistré comme une seule pièce.
- 5 boxers ENTUSIA sont vendus à l'unité entre 35 € et 44,67 €. S'ils sont lavables et réutilisables, c'est cohérent ; sinon le prix ou le conditionnement est faux.
- Le nombre de pièces n'est enregistré nulle part : il n'existe que dans le nom du produit. Le prix par pièce ne peut donc pas être calculé de façon fiable aujourd'hui.

**Organisation**
- 25 catégories existent sans aucun produit.
- La nutrition représente 50 produits sur 145, mélangés aux protections.
- Aucun produit n'a de variantes enregistrées : chaque taille est une fiche séparée. Le regroupement des tailles sur une seule fiche n'est donc pas possible sans modifier les données.
- Bonne nouvelle : tous les produits ont au moins une photo et un prix.

**Ce que je vous demande de confirmer**
1. Les cinq prix ci-dessus : corrects ou à corriger ? (je ne touche à rien sans votre accord)
2. Les boxers ENTUSIA sont-ils lavables ?
3. Puis-je enregistrer le nombre de pièces de chaque produit, en le reprenant de son nom, pour afficher le prix par pièce ?
4. Puis-je regrouper les tailles d'un même modèle sur une seule fiche ? Cela change la façon dont les produits sont enregistrés (les adresses des pages, le panier et les abonnements existants restent intacts).

## 2. Ce que je construis maintenant (sans toucher aux données)

**Trois chemins en haut de la boutique**
- « Je connais ma référence » : ouvre la recherche par nom, code ou marque.
- « Je cherche une protection adaptée » : ouvre l'aide au choix existante.
- « J'achète pour un proche » : questions orientées aidant (personne mobile, alitée, jour/nuit).

**Catégories en langage courant**, avec une phrase d'explication et un pictogramme :
protections à enfiler, protections avec attaches, protections anatomiques, protections légères, alèses, soins de la peau. La nutrition devient un accès séparé, hors du bloc protections.

**Cartes produit** : nom lisible, photo, forme du produit, taille, absorption seulement si pertinente (jamais sur un soin de peau), nombre de pièces, prix total, et prix par pièce seulement quand le nombre de pièces est fiable. Visuel de secours propre si une photo ne charge pas.

**Filtres** : au départ seulement taille, absorption et marque, adaptés à la catégorie choisie. Le reste passe dans « Plus de filtres ». Tri clair, bouton pour tout effacer, et un écran « aucun résultat » qui propose de relâcher un filtre ou de repartir de l'aide au choix.

**Français cohérent** : les libellés techniques ou anglais visibles sont remplacés par des termes compréhensibles. Les noms officiels des marques ne changent pas.

## 3. Détails techniques

- Fichiers concernés : `src/pages/Shop.tsx`, `src/components/shop/ProductCard.tsx`, un nouveau composant d'entrée à trois chemins, un mapping catégorie → libellé courant + icône + explication.
- Aucune migration de base de données dans cette étape.
- Le nombre de pièces est lu depuis le nom (`- 24pc`) uniquement pour l'affichage, sans écriture en base.
- Les adresses des pages produit, le panier, le stock et les abonnements restent inchangés.
- Tests Playwright sur ordinateur (1280 px) et mobile (390 px) : référence connue, pants pour personne mobile, protection pour personne alitée, alèses, nutrition, plus fiche produit, panier et abonnement.
