import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Clock, 
  Heart, 
  TrendingUp, 
  Package, 
  Users,
  Stethoscope,
  Building2,
  Pill,
  CheckCircle,
  Zap,
  Target,
  Shield,
  Headphones,
  BarChart3,
  Smartphone,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

import prescriberImage1 from "@/assets/prescriber-1.jpeg";
import prescriberImage2 from "@/assets/prescriber-2.jpeg";
import prescriberImage3 from "@/assets/prescriber-3.jpeg";
import prescriberImage4 from "@/assets/prescriber-4.jpeg";

const heroImages = [prescriberImage1, prescriberImage2, prescriberImage3, prescriberImage4];

const prescriberTypes = [
  {
    icon: Building2,
    badge: "Établissements",
    title: "Maisons de repos & EHPAD",
    description: "Optimisez la prise en charge de vos résidents avec des solutions personnalisées.",
    benefits: [
      "Réduction des coûts d'approvisionnement jusqu'à 30%",
      "Amélioration du confort et bien-être des résidents",
      "Gain de temps pour vos équipes soignantes",
      "Suivi personnalisé et rapports détaillés mensuels"
    ],
  },
  {
    icon: Stethoscope,
    badge: "Prescripteurs",
    title: "Médecins & Spécialistes",
    description: "Enrichissez votre offre de soins avec une solution complète pour vos patients.",
    benefits: [
      "Continuité de soins optimale pour vos patients",
      "Interface de suivi patient intégrée",
      "Recommandations personnalisées automatiques",
      "Partenariat privilégié avec SerenCare"
    ],
  },
  {
    icon: Pill,
    badge: "Partenaires",
    title: "Infirmières partenaires",
    description: "Développez votre activité en accompagnant nos clients.",
    benefits: [
      "Rémunération fixe par consultation visio/téléphonique",
      "Flexibilité totale des horaires",
      "Formation spécialisée incontinence incluse",
      "Plateforme technique moderne fournie"
    ],
  },
];

const benefits = [
  { icon: Zap, title: "Solution Clé en Main", description: "Intégration rapide et simple, sans investissement technique initial." },
  { icon: Target, title: "Ciblage Précis", description: "Algorithme d'IA pour des recommandations personnalisées et efficaces." },
  { icon: Users, title: "Accompagnement Expert", description: "Équipe d'infirmières spécialisées pour un suivi professionnel." },
  { icon: TrendingUp, title: "Croissance Garantie", description: "Augmentation prouvée de la satisfaction patient et de la rentabilité." },
  { icon: Shield, title: "Conformité Totale", description: "Respect des normes RGPD, HAS et certification ISO 27001." },
  { icon: Headphones, title: "Disponibilité 24/7", description: "Service client et support technique disponible en permanence." },
  { icon: BarChart3, title: "Analytics Avancés", description: "Tableaux de bord détaillés pour optimiser vos performances." },
  { icon: Smartphone, title: "Technologie Mobile", description: "Application native pour une expérience utilisateur optimale." },
];

const stats = [
  { value: "500+", label: "Professionnels partenaires" },
  { value: "98%", label: "Satisfaction client" },
  { value: "+150%", label: "Croissance annuelle" },
];

const Prescribers = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Espace Pro - Rejoignez l'écosystème SerenCare | SerenCare</title>
        <meta name="description" content="Intégrez la première plateforme de soins d'incontinence qui révolutionne l'accompagnement des patients. EHPAD, médecins, infirmières : devenez partenaire." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight text-sm font-medium text-primary mb-6">
                  <Shield className="w-4 h-4" />
                  Solution professionnelle certifiée
                </div>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Rejoignez l'écosystème
                  <br />
                  <span className="text-primary">SerenCare Pro</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Intégrez la première plateforme de soins d'incontinence qui révolutionne l'accompagnement des patients 
                  et facilite le travail des professionnels de santé.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button asChild size="lg" className="gap-2">
                    <a href="#contact">
                      Devenir partenaire
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#benefits">
                      Découvrir les avantages
                    </a>
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="font-display text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Media zone with slideshow */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={heroImages[currentImageIndex]}
                      alt="Professionnel de santé accompagnant un patient"
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                </div>
                
                {/* Slideshow indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {heroImages.map((_, index) => (
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
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Qui que vous soyez, nous avons une solution pour vous
              </h2>
              <p className="text-muted-foreground">
                Rejoignez notre écosystème de professionnels de santé et développez votre activité 
                avec des solutions innovantes adaptées à vos besoins spécifiques.
              </p>
            </motion.div>

            {/* Prescriber Types */}
            <div className="grid md:grid-cols-3 gap-6">
              {prescriberTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-7 border border-border shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{type.badge}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {type.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-5">
                    {type.description}
                  </p>

                  <ul className="space-y-3 mb-6 flex-1">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="outline" className="w-full">
                    <a href="#contact">En savoir plus</a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section id="benefits" className="py-16 bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Avantages Exclusifs</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pourquoi choisir SerenCare comme partenaire ?
              </h2>
              <p className="text-muted-foreground">
                Nous ne sommes pas juste un fournisseur, nous sommes votre partenaire stratégique 
                pour transformer la prise en charge de l'incontinence.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Retour sur Investissement</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Un ROI mesurable dès le premier mois
                </h2>
                <p className="text-muted-foreground mb-8">
                  Nos partenaires constatent en moyenne une amélioration de 40% de leur efficacité opérationnelle 
                  et une augmentation de 25% de la satisfaction client.
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Réduction des coûts opérationnels", value: "-30%" },
                    { label: "Augmentation du taux de rétention", value: "+45%" },
                    { label: "Amélioration de la satisfaction", value: "+60%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="font-display font-bold text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-highlight rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Headphones className="w-6 h-6 text-primary" />
                  <span className="font-display font-semibold text-foreground">Support Premium</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-2">
                  Réponse sous 2h garantie
                </p>
                <p className="text-muted-foreground text-sm">
                  Notre équipe dédiée vous accompagne à chaque étape de votre partenariat.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="section-padding bg-primary">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Transformez votre pratique dès aujourd'hui
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Découvrez pourquoi notre solution révolutionnaire transforme la pratique professionnelle. 
                Rejoignez l'innovation dans le secteur de la santé.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Button size="lg" variant="white">
                  Planifier une démonstration
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <a href="tel:+3202648422">
                    <Phone className="w-4 h-4 mr-2" />
                    +32 02 648 42 22
                  </a>
                </Button>
              </div>

              {/* Contact info */}
              <div className="grid sm:grid-cols-3 gap-4 text-primary-foreground/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Lun-Dim 8h-20h</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@pharmacie-allard.be" className="hover:text-primary-foreground">
                    contact@pharmacie-allard.be
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Ixelles, Belgique</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Prescribers;
