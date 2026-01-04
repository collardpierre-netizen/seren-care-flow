import { motion } from "framer-motion";
import { Shield, Award, Leaf } from "lucide-react";

const brands = [
  {
    name: "TENA",
    description: "Leader mondial, plus de 50 ans d'expertise",
    features: ["Confort optimal", "Absorption performante"],
  },
  {
    name: "Hartmann",
    description: "Qualité allemande, innovation continue",
    features: ["Technologie avancée", "Peau saine"],
  },
  {
    name: "Lille Healthcare",
    description: "Excellence française, proximité",
    features: ["Made in France", "Éco-responsable"],
  },
];

const TrustSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Marques de confiance</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Uniquement des marques reconnues
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous travaillons exclusivement avec les leaders du marché. Qualité garantie, efficacité prouvée.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">{brand.name}</h3>
              </div>

              <p className="text-muted-foreground mb-6">{brand.description}</p>

              <div className="space-y-3">
                {brand.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Leaf className="w-3 h-3 text-secondary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Accompagnement", value: "Humain" },
            { label: "Livraison", value: "Gratuite" },
            { label: "Engagement", value: "Zéro" },
            { label: "Flexibilité", value: "Totale" },
          ].map((item) => (
            <div key={item.label} className="text-center p-6 rounded-2xl bg-accent/50">
              <div className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
