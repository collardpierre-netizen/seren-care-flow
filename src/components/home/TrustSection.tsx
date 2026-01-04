import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";

const brands = [
  {
    name: "TENA",
    tagline: "Leader mondial",
    description: "Plus de 50 ans d'expertise dans le soin et le confort.",
  },
  {
    name: "Hartmann",
    tagline: "Qualité allemande",
    description: "Innovation et rigueur au service de votre bien-être.",
  },
  {
    name: "Lille Healthcare",
    tagline: "Excellence française",
    description: "Savoir-faire local, engagement éco-responsable.",
  },
];

const TrustSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-sm font-medium text-secondary mb-6">
              <Shield className="w-4 h-4" />
              Marques de confiance
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Uniquement les meilleures marques.
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Nous avons sélectionné trois marques leaders pour leur qualité, leur efficacité et leur engagement. 
              Pas de compromis sur ce qui compte.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {["Qualité médicale", "Confort optimal", "Discrétion", "Absorption éprouvée"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Brand Cards */}
          <div className="space-y-4">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-primary-foreground font-display font-bold text-lg">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {brand.name}
                      </h3>
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        {brand.tagline}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {brand.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
