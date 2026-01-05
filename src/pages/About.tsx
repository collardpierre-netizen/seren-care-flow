import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Users, Shield, Sparkles, Phone, Mail, MapPin, Clock, Video } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CallbackDialog } from "@/components/CallbackDialog";
import { AppointmentDialog } from "@/components/AppointmentDialog";

import aboutImage1 from "@/assets/about-1.jpeg";
import aboutImage2 from "@/assets/about-2.jpeg";
import aboutImage3 from "@/assets/about-3.jpeg";
import aboutImage4 from "@/assets/about-4.jpeg";
import foundersImage from "@/assets/founders.png";

const aboutImages = [aboutImage1, aboutImage2, aboutImage3, aboutImage4];

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Story with Media Zone */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Media zone à gauche */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative order-2 lg:order-1"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="w-full h-full"
                    >
                      <img
                        src={aboutImages[currentImageIndex]}
                        alt="Personnes heureuses et actives"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                </div>
                
                {/* Slideshow indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {aboutImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? "bg-primary w-6"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              </motion.div>

              {/* Text content à droite */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
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
        <section id="faq" className="section-padding scroll-mt-24">
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

        {/* Team CTA Section */}
        <section className="section-padding bg-primary/5">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wide">Notre équipe</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Rencontrez nos fondateurs
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Deux passionnés qui ont créé SerenCare pour accompagner les familles avec bienveillance.
                </p>

                {/* Founders with badges */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-10 mb-10">
                  {/* Founder 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20 shadow-lg">
                        <span className="font-display text-4xl md:text-5xl font-bold text-primary">OH</span>
                      </div>
                      {/* Badge pharmacien */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-md">
                        Pharmacien titulaire
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg mt-4">Olivier Hall</h3>
                    <p className="text-sm text-muted-foreground">Co-fondateur</p>
                  </motion.div>

                  {/* Founder 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20 shadow-lg">
                        <span className="font-display text-4xl md:text-5xl font-bold text-primary">PC</span>
                      </div>
                      {/* Badge conseiller */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-md">
                        Expert e-santé
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg mt-4">Pierre Collard</h3>
                    <p className="text-sm text-muted-foreground">Co-fondateur</p>
                  </motion.div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Notre équipe de pharmaciens et conseillers est à votre disposition pour répondre à vos questions 
                  et vous accompagner dans le choix des meilleures solutions.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <CallbackDialog />
                  <AppointmentDialog />
                </div>
              </div>
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
                      <p className="font-display font-bold text-foreground mb-1">Lun-Ven 9h-15h</p>
                      <p className="text-sm text-muted-foreground">Du lundi au vendredi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground mb-1">ohall@noralphar.com</p>
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
