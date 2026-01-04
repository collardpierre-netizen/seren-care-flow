import { motion } from "framer-motion";
import { MessageCircle, Package, Truck, RefreshCw } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Choisissez ou faites-vous guider",
    description: "Répondez à quelques questions simples ou appelez-nous. On vous aide à trouver la bonne protection.",
  },
  {
    icon: Package,
    title: "Recevez votre première livraison",
    description: "Vos produits arrivent chez vous sous 48h. Livraison gratuite, emballage discret.",
  },
  {
    icon: RefreshCw,
    title: "Ajustez à tout moment",
    description: "Changez de produit, modifiez la quantité ou la fréquence. Sans engagement, sans surprise.",
  },
  {
    icon: Truck,
    title: "Recevez automatiquement",
    description: "Plus besoin d'y penser. Vos protections arrivent chaque mois, exactement quand il faut.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En quelques étapes simples, recevez les bonnes protections sans plus jamais y penser.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="bg-background rounded-2xl p-8 shadow-soft border border-border/50 h-full hover:shadow-card transition-shadow duration-300">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-5xl font-display font-bold text-border">{index + 1}</span>
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
