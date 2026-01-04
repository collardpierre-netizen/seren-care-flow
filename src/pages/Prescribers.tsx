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
    description: "Recommandez SerenCare à vos patients et libérez du temps pour les soins.",
    benefits: [
      "Moins de temps sur la logistique",
      "Continuité des soins assurée",
      "Commission récurrente",
    ],
    href: "/prescripteurs/professionnels",
  },
  {
    icon: Pill,
    title: "Pharmaciens",
    description: "Proposez un service complémentaire sans gérer le stock.",
    benefits: [
      "Pas de stock à gérer",
      "Fidélisation client",
      "Revenus additionnels",
    ],
    href: "/prescripteurs/pharmaciens",
  },
  {
    icon: Building2,
    title: "EHPAD & Résidences",
    description: "Simplifiez l'approvisionnement et la gestion des protections.",
    benefits: [
      "Livraison automatique",
      "Gestion simplifiée",
      "Tarifs préférentiels",
    ],
    href: "/prescripteurs/etablissements",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Gagnez du temps",
    description: "Moins de temps sur les aspects non-médicaux. Plus de temps pour vos patients.",
  },
  {
    icon: Heart,
    title: "Améliorez l'observance",
    description: "Livraison automatique = plus de rupture. Vos patients sont mieux protégés.",
  },
  {
    icon: TrendingUp,
    title: "Commission récurrente",
    description: "Recevez une commission chaque mois pour chaque patient actif que vous recommandez.",
  },
  {
    icon: Package,
    title: "Zéro logistique",
    description: "Pas de stock, pas de commande, pas de livraison à gérer. On s'occupe de tout.",
  },
];

const Prescribers = () => {
  return (
    <>
      <Helmet>
        <title>Prescripteurs - Partenariat SerenCare</title>
        <meta name="description" content="Rejoignez SerenCare en tant que prescripteur. Infirmiers, médecins, pharmaciens, EHPAD : recommandez nos protections et percevez une commission récurrente." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-br from-background via-accent/30 to-background py-16 md:py-24">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Programme Prescripteurs</span>
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Recommandez SerenCare,
                <span className="block text-primary">concentrez-vous sur les soins</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Libérez-vous de la logistique des protections. Vos patients reçoivent automatiquement ce dont ils ont besoin.
                Vous percevez une commission récurrente.
              </p>

              <Button asChild size="lg" className="gap-2">
                <a href="#contact">
                  Devenir prescripteur partenaire
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Prescriber Types */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Vous êtes professionnel de santé ?
              </h2>
              <p className="text-muted-foreground">
                Découvrez comment SerenCare peut vous aider.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {prescriberTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <type.icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {type.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 flex-1">
                    {type.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {type.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3 text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-secondary" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="outline" className="w-full">
                    <Link to={type.href}>
                      En savoir plus
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding bg-accent/30">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pourquoi recommander SerenCare ?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Prêt à simplifier la vie de vos patients ?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Rejoignez notre réseau de prescripteurs partenaires. Inscription gratuite, accompagnement dédié.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Devenir partenaire
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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
