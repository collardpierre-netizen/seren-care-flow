import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Phone, ClipboardList, ArrowRight, MessageCircle, Clock } from "lucide-react";

const GuidedChoice = () => {
  return (
    <>
      <Helmet>
        <title>Aide au choix - SerenCare</title>
        <meta name="description" content="Pas sûr de ce dont vous avez besoin ? Répondez à quelques questions ou appelez-nous. Nous vous aidons à trouver la protection adaptée." />
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
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Nous sommes là pour vous</span>
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Choisir pour un proche,
                <span className="block text-primary">c'est normal d'hésiter</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Vous n'êtes pas seul. Notre équipe vous accompagne pour trouver la protection adaptée, 
                sans stress, sans jargon médical.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Two Options */}
        <section className="section-padding">
          <div className="container-main">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Comment voulez-vous être accompagné ?
                </h2>
                <p className="text-muted-foreground">
                  Deux façons simples de trouver ce qu'il vous faut.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Questionnaire Option */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <ClipboardList className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    Questionnaire guidé
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>2 minutes</span>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Répondez à 5 questions simples. Nous vous recommandons ensuite les produits 
                    les plus adaptés à votre situation.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Questions simples, sans jargon",
                      "Recommandation personnalisée",
                      "Possibilité d'ajuster ensuite",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-secondary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button asChild size="lg" className="w-full">
                    <Link to="/questionnaire" className="gap-2">
                      Commencer le questionnaire
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Call Option */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-primary rounded-3xl p-8 shadow-card"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-6">
                    <MessageCircle className="w-8 h-8 text-primary-foreground" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-primary-foreground mb-3">
                    Parler à une vraie personne
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>10-15 minutes</span>
                  </div>

                  <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                    Préférez parler de vive voix ? Notre équipe est là pour vous écouter, 
                    comprendre votre situation et vous guider.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Écoute bienveillante",
                      "Conseils personnalisés",
                      "Sans engagement",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-primary-foreground" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <a href="tel:0123456789" className="gap-2">
                      <Phone className="w-5 h-5" />
                      Appelez le 01 23 45 67 89
                    </a>
                  </Button>

                  <p className="text-center text-xs text-primary-foreground/60 mt-4">
                    Du lundi au vendredi, 9h-18h
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Reassurance */}
        <section className="section-padding bg-accent/30">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Une chose importante à retenir
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Quoi que vous choisissiez, vous pourrez toujours ajuster ensuite. 
                Changer de produit, de quantité, de fréquence. Sans frais, sans justification.
              </p>
              <p className="text-primary font-medium">
                Rien n'est figé. Votre tranquillité d'esprit, oui.
              </p>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default GuidedChoice;
