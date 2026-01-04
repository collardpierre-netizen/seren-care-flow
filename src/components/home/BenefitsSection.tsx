import { motion } from "framer-motion";
import { Heart, Clock, Shield, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Accompagnement humain",
    description: "Une vraie personne au téléphone. Pas un chatbot. Nous comprenons votre situation.",
  },
  {
    icon: Clock,
    title: "Zéro charge mentale",
    description: "Plus de courses de dernière minute. Vos protections arrivent quand il faut.",
  },
  {
    icon: Shield,
    title: "Qualité garantie",
    description: "Marques leaders. Produits testés. Efficacité prouvée. Aucun compromis.",
  },
  {
    icon: Sparkles,
    title: "Flexibilité totale",
    description: "Changez, pausez ou arrêtez quand vous voulez. Sans frais, sans justification.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="section-padding bg-primary">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Pourquoi SerenCare ?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Parce que s'occuper d'un proche ne devrait pas ajouter du stress à votre quotidien.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-primary-foreground/80 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "48h", label: "Délai de livraison" },
            { value: "0€", label: "Frais de livraison" },
            { value: "0", label: "Engagement" },
            { value: "100%", label: "Flexible" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
