import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles, Phone, Mail, MapPin, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, absolument ! Votre abonnement est sans engagement. Vous pouvez l'annuler à tout moment depuis votre espace client ou en contactant notre équipe. Aucun frais d'annulation ne sera appliqué."
  },
  {
    question: "Que faire si la taille ne convient pas ?",
    answer: "Pas de panique ! Notre équipe d'experts est là pour vous aider à trouver la bonne taille. Contactez-nous et nous vous enverrons gratuitement un échange. Nous proposons également un Starter Pack à 2,90€ pour tester différentes tailles avant de vous engager."
  },
  {
    question: "Puis-je suspendre pendant les vacances ?",
    answer: "Bien sûr ! Vous pouvez mettre votre abonnement en pause à tout moment depuis votre espace client. C'est idéal pour les vacances ou les séjours prolongés. Reprenez quand vous le souhaitez, sans aucune démarche compliquée."
  },
  {
    question: "Comment fonctionne la livraison discrète ?",
    answer: "Toutes nos livraisons sont effectuées dans un emballage neutre, sans aucune mention du contenu. Le colis ne porte aucune indication sur les produits à l'intérieur. Votre vie privée est notre priorité absolue."
  },
  {
    question: "Un proche peut-il gérer mon abonnement ?",
    answer: "Oui, nous avons créé un espace dédié aux aidants familiaux. Votre proche peut gérer votre abonnement avec votre accord, tout en respectant votre autonomie. C'est simple, sécurisé et pensé pour faciliter l'entraide familiale."
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, Bancontact), le prélèvement automatique SEPA, et le paiement en 3x sans frais avec Alma. Tous les paiements sont sécurisés et chiffrés (SSL & 3D Secure)."
  },
  {
    question: "Combien coûte la livraison ?",
    answer: "La livraison est gratuite à partir de 49€ d'achat. En dessous de ce montant, les frais de livraison sont de 4,90€. La livraison s'effectue en 48h partout en Belgique."
  },
  {
    question: "Que contient le Starter Pack à 2,90€ ?",
    answer: "Le Starter Pack contient un échantillon de nos différents produits pour vous permettre de tester et trouver la protection qui vous convient le mieux. C'est la solution idéale pour découvrir notre gamme avant de vous engager sur un abonnement."
  },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>À propos - Notre mission | SerenCare</title>
        <meta name="description" content="SerenCare accompagne les familles. Notre mission : la tranquillité d'esprit pour tous. Découvrez notre histoire, nos valeurs et notre FAQ." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Notre mission :
                <span className="text-primary"> votre tranquillité d'esprit.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                S'occuper d'un proche peut être difficile. Nous voulons enlever une charge de vos épaules.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Pourquoi SerenCare ?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Quand on accompagne un parent âgé, les décisions s'accumulent. 
                  Le choix des protections ne devrait pas être une source de stress.
                </p>
                <p>
                  Face aux rayons de supermarché ou aux sites médicaux complexes, 
                  beaucoup se sentent perdus. Quelle absorption ? Quelle taille ?
                </p>
                <p className="text-foreground font-medium">
                  SerenCare est né de cette observation : les familles méritent un accompagnement humain, 
                  des produits de qualité, et la certitude que tout arrivera sans y penser.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/50">
          <div className="container-main">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
            >
              Nos valeurs
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {[
                { icon: Heart, title: "Bienveillance", description: "Chaque famille est unique." },
                { icon: Users, title: "Humanité", description: "De vraies personnes, pas des bots." },
                { icon: Shield, title: "Confiance", description: "Marques leaders uniquement." },
                { icon: Sparkles, title: "Simplicité", description: "Pas de jargon inutile." },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">❓ Questions fréquentes</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Vos questions, nos réponses
              </h2>
              <p className="text-muted-foreground">
                Toutes les réponses aux questions que vous vous posez. Notre équipe est là pour vous accompagner à chaque étape.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            {/* FAQ CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground mb-4">Une question spécifique ?</p>
              <p className="text-sm text-muted-foreground">
                Notre équipe bienveillante est à votre disposition 7j/7 pour répondre à toutes vos questions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="section-padding bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
                Une question ?
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Pharmacie Allard — Notre équipe est disponible 7j/7.
              </p>

              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground mb-1">+32 02 648 42 22</p>
                      <p className="text-sm text-muted-foreground">Réponse sous 2h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground mb-1">Lun-Dim 8h-20h</p>
                      <p className="text-sm text-muted-foreground">Disponible 7j/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground mb-1">contact@pharmacie-allard.be</p>
                      <p className="text-sm text-muted-foreground">Réponse rapide garantie</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground mb-1">Av. de l'Hippodrome 148</p>
                      <p className="text-sm text-muted-foreground">1050 Ixelles, Belgique</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default About;
