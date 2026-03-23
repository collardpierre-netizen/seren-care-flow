import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    category: "Abonnement",
    questions: [
      {
        id: "how-subscription-works",
        question: "Comment fonctionne l'abonnement SerenCare ?",
        answer: `Notre abonnement a été pensé pour vous simplifier la vie !

**Il est totalement flexible, sans frais cachés et sans engagement.**

Les avantages :
- **10% d'économie** sur chaque commande
- **Livraison gratuite** dès 69€ TTC
- Un espace client pour modifier ou arrêter votre abonnement quand vous le souhaitez
- Des livraisons sur mesure : choisissez la fréquence qui vous convient (2, 3 ou 4 semaines)`,
      },
      {
        id: "modify-subscription",
        question: "Comment modifier mon abonnement ?",
        answer: `Rendez-vous dans **votre espace client** pour effectuer vos modifications.

Ce que vous pouvez changer, **à tout moment et sans frais** :
- La taille et le type de protection
- Ajouter ou retirer des produits
- Le mode de paiement
- La fréquence de livraison
- La date de la prochaine expédition
- Le lieu de livraison

Nous vous envoyons un email 3 jours avant chaque livraison pour vous laisser le temps de faire vos modifications.`,
      },
      {
        id: "too-many-products",
        question: "J'ai trop ou pas assez de protections, que faire ?",
        answer: `Notre abonnement étant totalement flexible, il vous suffit de :
- **Reculer ou avancer** la date de votre prochaine livraison
- **Modifier la fréquence** d'expédition (toutes les 2, 3 ou 4 semaines)
- **Ajuster les quantités** de produits

Vous pouvez faire ces modifications à tout moment depuis votre espace client.`,
      },
      {
        id: "cancel-subscription",
        question: "Comment annuler ou suspendre mon abonnement ?",
        answer: `Notre abonnement est **sans engagement** ! 

Vous pouvez :
- **Mettre en pause** temporairement (vacances, hospitalisation...)
- **Annuler définitivement** votre abonnement

Tout se fait depuis votre espace client, sans frais et sans justification à donner.`,
      },
      {
        id: "payment-date",
        question: "Quand ma carte est-elle débitée ?",
        answer: `Votre carte est débitée **à la date de préparation** de votre commande, selon la fréquence que vous avez choisie.

Par défaut, les envois sont effectués tous les 30 jours, mais vous pouvez choisir une fréquence de 2, 3 ou 4 semaines.

Si vous devez changer de carte bancaire, vous pouvez le faire depuis votre espace client.`,
      },
    ],
  },
  {
    category: "Livraison",
    questions: [
      {
        id: "delivery-time",
        question: "Quels sont les délais de livraison ?",
        answer: `Nous livrons en **Belgique sous 2-3 jours ouvrés** à partir de l'expédition.

Modes de livraison disponibles :
- **Point relais** : Gratuit dès 69€ TTC (sinon 4,90€)
- **À domicile** : Gratuit dès 69€ TTC (sinon 8,75€)

Pour les abonnés, la **livraison est gratuite** dès 69€ TTC d'achat.`,
      },
      {
        id: "track-order",
        question: "Comment suivre mon colis ?",
        answer: `Dès que votre commande quitte notre entrepôt, vous recevez un **email avec un lien de suivi**.

Vous pouvez également suivre votre colis depuis votre espace client, dans la section "Mes commandes".`,
      },
      {
        id: "change-delivery-address",
        question: "Comment changer mon adresse de livraison ?",
        answer: `Rendez-vous dans votre espace client > Mes abonnements > Modifier > Mode de livraison.

Veillez à modifier votre **adresse principale** pour que le changement soit pris en compte pour vos prochaines commandes.`,
      },
    ],
  },
  {
    category: "Produits et tailles",
    questions: [
      {
        id: "how-to-choose-size",
        question: "Comment choisir la bonne taille ?",
        answer: `Munissez-vous d'un mètre souple :
- Mesurez le **tour de taille** au niveau du nombril, sans serrer
- Mesurez le **tour de hanches** au point le plus large

👉 Retenez toujours **la mesure la plus grande** pour choisir votre taille.

Consultez notre guide des tailles disponible sur chaque fiche produit.`,
      },
      {
        id: "between-sizes",
        question: "Je suis entre deux tailles, que faire ?",
        answer: `Si vous êtes entre deux tailles, nous recommandons de **choisir la plus petite** :
- Meilleure tenue
- Plus discrète
- Moins de risque de fuites

Si la protection semble trop serrée, vous pouvez facilement passer à la taille au-dessus.`,
      },
      {
        id: "wrong-size",
        question: "Et si je me trompe de taille ?",
        answer: `Pas de panique ! Vous pouvez **modifier la taille à tout moment** dans votre abonnement.

Important à savoir :
- Une taille trop grande peut provoquer des fuites
- Une taille bien ajustée améliore le confort et la sécurité

En cas de doute, n'hésitez pas à nous contacter.`,
      },
      {
        id: "incontinence-level",
        question: "Comment choisir le bon niveau d'absorption ?",
        answer: `Nous classons nos produits selon 4 niveaux d'absorption :
- **Légère** : quelques gouttes occasionnelles
- **Modérée** : fuites régulières plusieurs fois par jour
- **Forte** : fuites importantes nécessitant une protection continue
- **Très forte** : incontinence complète jour et nuit

Notre questionnaire d'aide au choix peut vous aider à trouver le bon produit.`,
      },
    ],
  },
  {
    category: "Retours et remboursements",
    questions: [
      {
        id: "return-policy",
        question: "Quelle est votre politique de retour ?",
        answer: `**Pour les abonnés** : Vous pouvez vous faire rembourser tous les paquets **non ouverts** commandés dans les 3 derniers mois.

**Pour les achats ponctuels** : Retours possibles sous 14 jours après réception, si les produits sont non utilisés et dans leur emballage d'origine.

Pour effectuer un retour, contactez notre service client.`,
      },
      {
        id: "refund-time",
        question: "Combien de temps pour recevoir mon remboursement ?",
        answer: `Une fois votre colis de retour reçu et vérifié dans notre entrepôt, le remboursement est effectué sous **3 à 5 jours ouvrés** sur votre moyen de paiement initial.

Le délai total peut être de 2 à 3 semaines en comptant le transport du colis retour.`,
      },
    ],
  },
  {
    category: "Remboursement mutuelle",
    questions: [
      {
        id: "mutuelle-remboursement",
        question: "Est-ce que ma mutuelle rembourse les protections SerenCare ?",
        answer: `En Belgique, l'assurance soins de santé (INAMI) prévoit **deux forfaits annuels** pour les personnes souffrant d'incontinence urinaire :

- **Forfait 1 — Personnes dépendantes** : environ **580€/an** (accordé automatiquement si vous bénéficiez de soins infirmiers avec un score Katz 3 ou 4 pour l'incontinence)
- **Forfait 2 — Incontinence non traitable** : environ **205€/an** (sur attestation de votre médecin, accord valable 3 ans)

Ces forfaits sont versés directement par votre mutuelle sur votre compte. Ils ne sont pas liés à un prestataire spécifique — vous pouvez les utiliser librement pour financer vos commandes SerenCare.

👉 Consultez notre **guide complet** : [En savoir plus](/guides/remboursement-protections-incontinence-belgique)`,
      },
      {
        id: "mutuelle-demarches",
        question: "Comment demander le remboursement à la MC / Solidaris ?",
        answer: `Toutes les mutuelles belges (MC, Solidaris, Partenamut, Mutualité Libre, CAAMI) appliquent les mêmes forfaits INAMI. La démarche est simple :

1. **Consultez votre médecin traitant** — il remplit le formulaire de demande d'intervention pour incontinence
2. **Remettez le formulaire à votre mutuelle** (guichet, courrier ou en ligne)
3. **Recevez le versement annuel** directement sur votre compte bancaire

L'accord est valable **3 ans** et renouvelable. Vous n'avez pas à refaire la démarche chaque année.

Pour le **Forfait 1**, tout se fait automatiquement si vous avez des soins infirmiers à domicile.`,
      },
      {
        id: "mutuelle-conditions",
        question: "Quelles conditions remplir pour le forfait incontinence ?",
        answer: `**Pour le Forfait 1 (~580€/an)** :
- Bénéficier de soins infirmiers (forfaits B ou C) pendant au moins **4 mois sur 12**
- Score **3 ou 4 sur l'échelle de Katz** pour le critère incontinence
- Ne pas résider en maison de repos

**Pour le Forfait 2 (~205€/an)** :
- Souffrir d'une **incontinence durable et incurable**, reconnue par un médecin
- Ne pas bénéficier simultanément du Forfait 1

**Bon à savoir** : le forfait mutuelle se cumule avec la réduction **-10% de l'abonnement SerenCare**. Les deux sont totalement indépendants.`,
      },
    ],
  },
];

interface SubscriptionFAQProps {
  category?: string;
  maxItems?: number;
}

const SubscriptionFAQ: React.FC<SubscriptionFAQProps> = ({ category, maxItems }) => {
  const filteredCategories = category
    ? faqItems.filter((cat) => cat.category === category)
    : faqItems;

  return (
    <div className="space-y-8">
      {filteredCategories.map((cat) => {
        const questions = maxItems ? cat.questions.slice(0, maxItems) : cat.questions;
        
        return (
          <div key={cat.category}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {cat.category}
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              {questions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border rounded-xl px-4 bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium text-foreground">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: item.answer
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionFAQ;
