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
  Pill
} from "lucide-react";

import prescriberImage1 from "@/assets/prescriber-1.jpeg";
import prescriberImage2 from "@/assets/prescriber-2.jpeg";
import prescriberImage3 from "@/assets/prescriber-3.jpeg";

const heroImages = [prescriberImage1, prescriberImage2, prescriberImage3];

const prescriberTypes = [
  {
    icon: Stethoscope,
    title: "Infirmiers & Médecins",
    description: "Libérez du temps pour les soins. Vos patients sont livrés automatiquement.",
    benefits: ["Moins de logistique", "Continuité des soins", "Commission récurrente"],
    href: "/prescripteurs/professionnels",
  },
  {
    icon: Pill,
    title: "Pharmaciens",
    description: "Un service complémentaire sans stock à gérer.",
    benefits: ["Pas de stock", "Fidélisation client", "Revenus additionnels"],
    href: "/prescripteurs/pharmaciens",
  },
  {
    icon: Building2,
    title: "EHPAD & Résidences",
    description: "Approvisionnement automatique, gestion simplifiée.",
    benefits: ["Livraison planifiée", "Gestion centralisée", "Tarifs préférentiels"],
    href: "/prescripteurs/etablissements",
  },
];

const benefits = [
  { icon: Clock, title: "Temps libéré", description: "Moins de tâches administratives." },
  { icon: Heart, title: "Meilleure observance", description: "Plus de rupture de stock." },
  { icon: TrendingUp, title: "Commission", description: "Revenus récurrents." },
  { icon: Package, title: "Zéro logistique", description: "On gère tout." },
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
        <title>Prescripteurs - Partenariat SerenCare</title>
        <meta name="description" content="Rejoignez SerenCare. Infirmiers, médecins, pharmaciens, EHPAD : recommandez nos protections et percevez une commission récurrente." />
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
                  <Users className="w-4 h-4" />
                  Programme Partenaires
                </div>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Concentrez-vous sur les soins.
                  <br />
                  <span className="text-primary">On s'occupe du reste.</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Recommandez SerenCare à vos patients. Ils reçoivent automatiquement leurs protections. 
                  Vous gagnez du temps et percevez une commission.
                </p>

                <Button asChild size="lg" className="gap-2">
                  <a href="#contact">
                    Devenir partenaire
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Button>
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
                  {/* Overlay gradient */}
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

        {/* Prescriber Types */}
        <section className="section-padding">
          <div className="container-main">
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
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <type.icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {type.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-5 flex-1">
                    {type.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="outline" className="w-full">
                    <Link to={type.href}>En savoir plus</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 bg-muted/50">
          <div className="container-main">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10"
            >
              Pourquoi recommander SerenCare ?
            </motion.h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-5 border border-border text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
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

        {/* CTA */}
        <section id="contact" className="section-padding bg-primary">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Prêt à simplifier la vie de vos patients ?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Inscription gratuite, accompagnement dédié.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="white">
                  Devenir partenaire
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <a href="mailto:prescripteurs@serencare.fr">
                    Nous contacter
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Prescribers;
