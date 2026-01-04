import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>À propos - Notre mission | SerenCare</title>
        <meta name="description" content="SerenCare accompagne les familles. Notre mission : la tranquillité d'esprit pour tous." />
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
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-muted/50 rounded-2xl p-10"
              >
                <blockquote className="text-xl font-display font-semibold text-foreground mb-4 leading-relaxed">
                  "Nous croyons que le soin d'un proche ne devrait pas être une source d'anxiété supplémentaire."
                </blockquote>
                <p className="text-sm text-muted-foreground">— L'équipe SerenCare</p>
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

        {/* Contact */}
        <section className="section-padding">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Une question ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe est disponible du lundi au vendredi.
              </p>
              <div className="bg-highlight rounded-xl p-6">
                <p className="font-display text-xl font-bold text-primary mb-1">
                  01 23 45 67 89
                </p>
                <p className="text-muted-foreground text-sm">
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
