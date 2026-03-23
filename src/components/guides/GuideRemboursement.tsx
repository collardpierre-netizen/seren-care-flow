import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ArrowRight, CheckCircle2, Info, Phone } from 'lucide-react';
import guideIllustration from '@/assets/guide-remboursement.jpg';

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const GuideRemboursement = () => {
  return (
    <div className="space-y-16">
      {/* Hero illustration */}
      <motion.div {...fadeIn} className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-8 md:p-12">
        <img 
          src={guideIllustration} 
          alt="Remboursement mutuelle pour protections d'incontinence en Belgique" 
          width={800} 
          height={512} 
          className="max-w-xs md:max-w-sm h-auto"
        />
      </motion.div>

      {/* SECTION 1: Les deux forfaits */}
      <motion.section {...fadeIn} className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-semibold text-primary border-primary/30">
            Ce que prévoit la loi belge
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Deux forfaits, deux profils
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            L'INAMI (Institut National d'Assurance Maladie-Invalidité) prévoit deux types de remboursements distincts. 
            Ils ne s'adressent pas aux mêmes personnes — il est important de comprendre lequel vous concerne.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Forfait 1 */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
              <p className="text-xs uppercase tracking-widest opacity-75 font-semibold mb-1">Forfait 1</p>
              <h3 className="text-lg font-bold mb-2">Personnes dépendantes</h3>
              <p className="text-3xl font-bold">~580 € <span className="text-base font-normal opacity-80">/ an*</span></p>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pour les personnes qui bénéficient de soins infirmiers à domicile et ont un niveau de dépendance élevé. 
                Le remboursement est accordé <strong className="text-foreground">automatiquement</strong> par la mutuelle.
              </p>
              <ul className="space-y-3">
                {[
                  <>Soins infirmiers (forfaits B ou C) pendant au moins <strong>4 mois sur les 12 derniers mois</strong></>,
                  <>Score <strong>3 ou 4 sur l'échelle de Katz</strong> pour le critère "incontinence"</>,
                  <>Ne pas séjourner en maison de repos ou hôpital (structures AVIQ/PHARE acceptées)</>,
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Forfait 2 */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-75 font-semibold mb-1">Forfait 2</p>
              <h3 className="text-lg font-bold mb-2">Incontinence non traitable</h3>
              <p className="text-3xl font-bold">~205 € <span className="text-base font-normal opacity-80">/ an*</span></p>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pour les personnes dont l'incontinence est reconnue comme incurable par un médecin, sans remplir les critères du forfait 1. 
                Une démarche simple auprès de votre médecin suffit.
              </p>
              <ul className="space-y-3">
                {[
                  <>Souffrir d'une <strong>incontinence durable et incurable</strong>, reconnue par un médecin</>,
                  <>Ne pas bénéficier du Forfait 1, ni d'intervention pour autosondage ou matériel INAMI art. 27</>,
                  <>Accord valable <strong>3 ans</strong>, renouvelable</>,
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground italic">
          * Les montants sont indexés chaque année par l'INAMI. Les chiffres indiqués sont approximatifs (base 2024). 
          Consultez l'INAMI ou votre mutuelle pour le montant exact en vigueur.
        </p>

        {/* Important box */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700 p-5 space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            À savoir avant tout
          </h4>
          <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-300">
            <li className="flex gap-2">
              <span className="font-semibold">→</span>
              <span>Ces remboursements sont accordés directement au patient par sa mutuelle — ce n'est <strong>pas une réduction automatique</strong> appliquée à votre commande.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">→</span>
              <span>Les protections achetées chez SerenCare peuvent être financées par ce forfait, mais <strong>aucun accord particulier n'est requis</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">→</span>
              <span>Vous n'avez pas besoin d'une prescription pour acheter — le remboursement est un <strong>forfait annuel</strong>, pas un remboursement à l'acte.</span>
            </li>
          </ul>
        </div>
      </motion.section>

      {/* SECTION 2: Par mutuelle */}
      <motion.section {...fadeIn} className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-semibold text-primary border-primary/30">
            Selon votre mutuelle
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ce que chaque mutuelle propose
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Toutes les mutuelles belges appliquent les forfaits INAMI obligatoires. 
            Certaines ajoutent des interventions complémentaires via leur assurance complémentaire.
          </p>
        </div>

        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-foreground">
                  <TableHead className="text-background font-semibold text-xs uppercase tracking-wider">Mutuelle</TableHead>
                  <TableHead className="text-background font-semibold text-xs uppercase tracking-wider">Forfait INAMI</TableHead>
                  <TableHead className="text-background font-semibold text-xs uppercase tracking-wider">Complémentaire</TableHead>
                  <TableHead className="text-background font-semibold text-xs uppercase tracking-wider">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: 'Mutualité Chrétienne (MC)',
                    inami: 'Forfaits 1 et 2 appliqués',
                    auto: true,
                    comp: 'Possible via assurance complémentaire. Renseignez-vous auprès de votre conseiller MC.',
                    contact: 'mc.be · 0800 10 9 8 7',
                  },
                  {
                    name: 'Solidaris',
                    inami: 'Forfaits 1 et 2 appliqués',
                    auto: true,
                    comp: 'Réductions sur matériel incontinence possibles via Solidaris Brabant. Vérifiez selon votre région.',
                    contact: 'solidaris.be',
                  },
                  {
                    name: 'Partenamut',
                    inami: 'Forfaits 1 et 2 appliqués',
                    auto: false,
                    comp: 'Interventions complémentaires variables selon le plan souscrit.',
                    contact: 'partenamut.be',
                  },
                  {
                    name: 'Mutualité Libre (MLOZ)',
                    inami: 'Forfaits 1 et 2 appliqués',
                    auto: false,
                    comp: 'Varie selon la mutualité libre affiliée (Euromut, SKP, etc.).',
                    contact: 'mloz.be',
                  },
                  {
                    name: 'CAAMI / Neutrale',
                    inami: 'Forfaits 1 et 2 appliqués',
                    auto: false,
                    comp: 'Renseignez-vous directement auprès de votre caisse.',
                    contact: 'caami-hvk.be',
                  },
                ].map((row, i) => (
                  <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/30' : ''}>
                    <TableCell className="font-semibold text-sm">{row.name}</TableCell>
                    <TableCell className="text-sm">
                      <span className="text-emerald-600">✅</span> {row.inami}
                      {row.auto && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">Auto</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.comp}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{row.contact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="rounded-xl bg-muted/50 border p-5 space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            Transparence sur ce tableau
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>ℹ️ Les montants des complémentaires changent chaque année et dépendent du plan souscrit.</p>
            <p>ℹ️ Seul votre conseiller mutualiste peut confirmer ce à quoi vous avez droit.</p>
            <p>ℹ️ Ce tableau reflète la situation générale en 2024–2025.</p>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: Démarches */}
      <motion.section {...fadeIn} className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-semibold text-primary border-primary/30">
            Pas à pas
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Comment demander le remboursement
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Pour le Forfait 1, tout se fait automatiquement si vous avez des soins infirmiers. 
            Pour le Forfait 2, voici comment procéder.
          </p>
        </div>

        <div className="space-y-0">
          {[
            {
              step: 1,
              title: 'Consultez votre médecin traitant',
              desc: 'Expliquez que vous souffrez d\'incontinence et souhaitez faire valoir votre droit au forfait INAMI. Votre médecin remplit le formulaire de demande d\'intervention pour incontinence urinaire non traitable.',
            },
            {
              step: 2,
              title: 'Remettez le formulaire à votre mutuelle',
              desc: 'Une fois signé par votre médecin, déposez ou envoyez le formulaire à votre mutuelle (guichet local, courrier ou espace en ligne). Le médecin-conseil examine ensuite la demande.',
            },
            {
              step: 3,
              title: 'Recevez le versement annuel',
              desc: 'Si votre demande est approuvée, votre mutuelle vous verse le montant directement sur votre compte bancaire. L\'accord est valable 3 ans — pas besoin de recommencer chaque année.',
            },
            {
              step: 4,
              title: 'Utilisez ce montant pour vos commandes SerenCare',
              desc: 'Ce forfait n\'est lié à aucun prestataire spécifique. Utilisez-le librement pour financer vos commandes SerenCare. Aucune démarche particulière de notre côté.',
            },
          ].map((item, i, arr) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0 relative z-10">
                  {item.step}
                </div>
                {i < arr.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border my-1" />
                )}
              </div>
              <div className={i < arr.length - 1 ? 'pb-8' : 'pb-2'}>
                <h4 className="font-semibold text-foreground mb-1 pt-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AViQ bonus */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h4 className="font-semibold text-sm mb-2">🏔️ Bonus wallon : l'AViQ</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Si vous résidez en Wallonie et êtes porteur d'un handicap reconnu par l'AViQ (Agence pour une Vie de Qualité), 
            vous pouvez bénéficier d'une intervention complémentaire aux forfaits INAMI. 
            Renseignez-vous sur{' '}
            <a href="https://www.aviq.be" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
              aviq.be
            </a>.
          </p>
        </div>
      </motion.section>

      {/* SECTION 4: FAQ */}
      <motion.section {...fadeIn} className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-semibold text-primary border-primary/30">
            Questions fréquentes
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ce qu'on nous demande souvent
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {[
            {
              q: "Est-ce que SerenCare s'occupe des démarches de remboursement à ma place ?",
              a: "Non — et nous préférons être honnêtes là-dessus. Les remboursements INAMI se font directement entre vous, votre médecin et votre mutuelle. SerenCare n'intervient pas dans ce processus. Ce guide vous donne toutes les informations pour faire les démarches vous-même, c'est simple et rapide.",
            },
            {
              q: "Dois-je garder mes factures SerenCare pour le remboursement ?",
              a: "Le forfait INAMI est une intervention annuelle forfaitaire — il n'est pas calculé en fonction de vos achats réels. Vous n'avez pas besoin de soumettre vos factures. Toutefois, il est toujours recommandé de conserver vos preuves d'achat pour votre propre suivi.",
            },
            {
              q: "Tout le monde peut bénéficier de ces remboursements ?",
              a: "Non. Les forfaits INAMI sont soumis à des conditions médicales spécifiques (voir plus haut). Une personne qui achète des protections par prévention légère, sans incontinence reconnue médicalement, n'y a pas droit. Nous ne voulons pas créer de fausses attentes sur ce point.",
            },
            {
              q: "Les produits SerenCare sont-ils reconnus par les mutuelles ?",
              a: "Les remboursements INAMI sont des forfaits annuels indépendants des marques ou prestataires. Les mutuelles ne « reconnaissent » pas de marques spécifiques pour ce forfait — vous utilisez l'argent comme vous le souhaitez. Les marques que nous proposons (TENA, Hartmann, Lille Healthcare) sont des leaders du marché médical.",
            },
            {
              q: "Peut-on cumuler le forfait INAMI avec la réduction -10% de l'abonnement SerenCare ?",
              a: "Oui, tout à fait. Le forfait mutuelle et votre remise abonnement SerenCare sont totalement indépendants. Vous bénéficiez de la réduction -10% sur chaque livraison automatique, et votre mutuelle vous verse séparément le forfait annuel si vous y avez droit. Les deux se cumulent.",
            },
            {
              q: "Mon proche est en maison de repos — peut-il quand même bénéficier du remboursement ?",
              a: "Pour le Forfait 1 (personnes dépendantes), les résidents de maisons de repos (MR/MRS) ne sont généralement pas éligibles, car ces établissements disposent de leurs propres dotations. Les personnes en structure AVIQ ou PHARE peuvent y avoir droit. Pour le Forfait 2, les conditions ne mentionnent pas de restriction liée au lieu de résidence — vérifiez avec votre mutuelle.",
            },
          ].map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium text-foreground text-sm">{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeIn}>
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Prêt à commander vos protections ?
          </h3>
          <p className="opacity-85 mb-6 max-w-md mx-auto">
            Choisissez vos produits maintenant. Notre questionnaire vous guide en 2 minutes vers la protection la plus adaptée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/boutique">
                Voir les produits <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/aide-au-choix">
                Être guidé
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Legal */}
      <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
        <strong>Avertissement légal :</strong> Ce guide est fourni à titre purement informatif par SerenCare. 
        Il ne constitue pas un conseil médical, juridique ou financier. Les montants des forfaits INAMI sont indexés annuellement — 
        consultez{' '}
        <a href="https://www.inami.fgov.be" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          l'INAMI
        </a>{' '}
        ou votre mutuelle pour les montants exacts en vigueur. Dernière mise à jour : 2025.
      </p>
    </div>
  );
};

export default GuideRemboursement;
