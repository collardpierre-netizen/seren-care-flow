import { motion } from "framer-motion";
import { Heart, Clock, Shield, Smile } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Accompagnement humain",
    description: "Une vraie personne au téléphone, qui comprend votre situation et vous guide avec bienveillance.",
  },
  {
    icon: Clock,
    title: "Zéro charge mentale",
    description: "Plus besoin de penser aux courses. Vos protections arrivent automatiquement, pile quand il faut.",
  },
  {
    icon: Shield,
    title: "Qualité garantie",
    description: "Uniquement des marques leaders. Des produits testés, efficaces, et adaptés à chaque besoin.",
  },
  {
    icon: Smile,
    title: "Flexibilité totale",
    description: "Changez, pausez ou arrêtez quand vous voulez. Sans frais, sans justification, sans engagement.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="section-padding bg-accent/30">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Pourquoi SerenCare ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Parce que s'occuper d'un proche ne devrait pas être une source de stress supplémentaire.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex gap-6 p-8 bg-card rounded-3xl shadow-soft border border-border/50"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-card">
                  <benefit.icon className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
