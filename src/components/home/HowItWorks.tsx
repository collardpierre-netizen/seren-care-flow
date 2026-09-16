import { motion } from "framer-motion";
import { Search, ListChecks, Truck, SlidersHorizontal } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Trouvez le produit",
    description: "Recherchez une référence connue ou utilisez le guide de comparaison.",
  },
  {
    icon: ListChecks,
    number: "02",
    title: "Vérifiez les informations",
    description: "Consultez la taille, la quantité par paquet, les caractéristiques du fabricant et le prix.",
  },
  {
    icon: Truck,
    number: "03",
    title: "Choisissez la livraison",
    description: "Commandez ponctuellement ou sélectionnez une fréquence lorsqu’une livraison régulière est proposée.",
  },
  {
    icon: SlidersHorizontal,
    number: "04",
    title: "Gardez le contrôle",
    description: "Consultez vos commandes et modifiez les options disponibles depuis votre compte.",
  },
];

const HowItWorks = () => {
  return (
    <section id="commande-proche" className="section-padding bg-muted/50 scroll-mt-24" aria-labelledby="how-title">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <h2 id="how-title" className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Une commande simple, même pour un proche
          </h2>
          <p className="text-lg text-muted-foreground">
            Retrouvez un produit, vérifiez ses informations et choisissez où le faire livrer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-7 h-full border border-border/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Number + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-display font-bold text-muted/60 group-hover:text-primary/20 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                    <step.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
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
