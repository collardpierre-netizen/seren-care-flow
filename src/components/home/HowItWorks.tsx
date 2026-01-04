import { motion } from "framer-motion";
import { MessageCircle, Package, RefreshCw, Truck } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Choisissez",
    description: "Sélectionnez vos produits ou laissez-nous vous guider avec quelques questions simples.",
  },
  {
    icon: Package,
    number: "02",
    title: "Recevez",
    description: "Votre première livraison arrive sous 48h. Emballage discret, livraison gratuite.",
  },
  {
    icon: RefreshCw,
    number: "03",
    title: "Ajustez",
    description: "Modifiez produits, quantités ou fréquence à tout moment. Sans engagement.",
  },
  {
    icon: Truck,
    number: "04",
    title: "Vivez sereinement",
    description: "Vos protections arrivent automatiquement. Plus besoin d'y penser.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple comme bonjour.
          </h2>
          <p className="text-lg text-muted-foreground">
            En quelques minutes, mettez en place un service qui vous enlève une charge pour de bon.
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
