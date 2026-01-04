import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight text-sm font-medium text-primary mb-6">
                <Users className="w-4 h-4" />
                Programme Partenaires
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Concentrez-vous sur les soins.
                <span className="text-primary"> On s'occupe du reste.</span>
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
