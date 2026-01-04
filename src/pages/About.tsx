import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>À propos - Notre mission | SerenCare</title>
        <meta name="description" content="SerenCare accompagne les familles dans le choix des protections pour leurs proches. Notre mission : la tranquillité d'esprit pour tous." />
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
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Notre mission : 
                <span className="block text-primary">votre tranquillité d'esprit</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                S'occuper d'un proche âgé peut être difficile. Nous voulons enlever une charge de vos épaules : 
                le choix et l'approvisionnement des protections.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container-main">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="prose prose-lg"
              >
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Pourquoi SerenCare ?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Quand on accompagne un parent âgé, les décisions médicales et logistiques s'accumulent. 
                  Le choix des protections ne devrait pas être une source de stress supplémentaire.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Pourtant, face aux rayons de supermarché ou aux sites médicaux complexes, 
                  beaucoup se sentent perdus. Quelle absorption ? Quelle taille ? Quelle marque faire confiance ?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  SerenCare est né de cette observation simple : les familles méritent un accompagnement humain, 
                  des produits de qualité, et la certitude que tout arrivera sans qu'ils aient à y penser.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-accent/30">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Nos valeurs
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: "Bienveillance",
                  description: "Chaque famille est unique. Nous écoutons avant de conseiller.",
                },
                {
                  icon: Users,
                  title: "Humanité",
                  description: "De vraies personnes au téléphone, pas des chatbots.",
                },
                {
                  icon: Shield,
                  title: "Confiance",
                  description: "Des marques leaders, des produits testés et approuvés.",
                },
                {
                  icon: Sparkles,
                  title: "Simplicité",
                  description: "Pas de jargon, pas de complexité inutile.",
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
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

        {/* Team placeholder */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Une équipe à votre écoute
              </h2>
              <p className="text-muted-foreground mb-8">
                Basés en France, nous sommes disponibles du lundi au vendredi pour vous accompagner. 
                Un appel, un email, et nous sommes là.
              </p>
              <div className="bg-accent rounded-2xl p-8">
                <p className="font-display text-xl font-semibold text-foreground mb-2">
                  01 23 45 67 89
                </p>
                <p className="text-muted-foreground">
                  contact@serencare.fr
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default About;
