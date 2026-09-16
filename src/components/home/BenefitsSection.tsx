import { motion } from "framer-motion";
import { Phone, Search, ListChecks, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: Phone,
    title: "Une aide accessible",
    description: "Contactez-nous pour comprendre les informations des produits et le fonctionnement du service.",
  },
  {
    icon: Search,
    title: "Une commande plus simple",
    description: "Recherchez une référence ou utilisez le guide pour réduire le temps passé à comparer.",
  },
  {
    icon: ListChecks,
    title: "Des informations lisibles",
    description: "Taille, quantité, prix et options de livraison sont présentés avant la commande.",
  },
  {
    icon: RefreshCw,
    title: "Une formule flexible",
    description: "Choisissez l’achat unique ou une livraison régulière lorsque celle-ci est disponible.",
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
            { value: "Suivi", label: "À chaque livraison" },
            { value: "Dès 69 €", label: "Livraison gratuite" },
            { value: "Ponctuel", label: "Achat unique" },
            { value: "Au choix", label: "Livraison régulière" },
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
