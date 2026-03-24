import React from "react";
import { motion } from "framer-motion";
import { Check, RefreshCw, Truck, Calendar, Percent, Heart, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SubscriptionBenefitsProps {
  variant?: "compact" | "full" | "card";
  showCTA?: boolean;
}

const benefits = [
  {
    icon: Percent,
    title: "10% d'économie",
    description: "Sur chaque commande, automatiquement appliqué",
  },
  {
    icon: Truck,
    title: "Livraison gratuite",
    description: "Dès 69€ TTC, livrée chez vous ou en point relais",
  },
  {
    icon: Calendar,
    title: "Fréquence flexible",
    description: "Toutes les 2, 3 ou 4 semaines selon vos besoins",
  },
  {
    icon: RefreshCw,
    title: "Modifiable à tout moment",
    description: "Changez de produit, de taille ou de quantité",
  },
  {
    icon: Heart,
    title: "Sans engagement",
    description: "Pause ou annulation gratuite, sans justification",
  },
  {
    icon: Package,
    title: "Jamais à court",
    description: "Livré automatiquement, plus de panique",
  },
];

const SubscriptionBenefits: React.FC<SubscriptionBenefitsProps> = ({
  variant = "full",
  showCTA = true,
}) => {
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground">L'abonnement SerenCare</h4>
            <p className="text-sm text-muted-foreground">Flexible, sans engagement</p>
          </div>
        </div>
        <ul className="space-y-2">
          {benefits.slice(0, 4).map((benefit) => (
            <li key={benefit.title} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-secondary flex-shrink-0" />
              <span><strong>{benefit.title}</strong> – {benefit.description}</span>
            </li>
          ))}
        </ul>
        {showCTA && (
          <Button asChild className="w-full mt-4" variant="outline">
            <Link to="/boutique" className="gap-2">
              Découvrir l'abonnement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Passez à l'abonnement</h3>
            <p className="text-muted-foreground">Et simplifiez-vous la vie</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        {showCTA && (
          <Button asChild className="w-full">
            <Link to="/boutique" className="gap-2">
              Découvrir nos produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-sm font-medium text-secondary mb-4">
            <RefreshCw className="w-4 h-4" />
            L'abonnement SerenCare
          </div>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simplifiez-vous la vie avec l'abonnement
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plus besoin d'y penser. Recevez vos protections automatiquement, 
            modifiez ou annulez à tout moment, sans engagement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button asChild size="lg">
              <Link to="/boutique" className="gap-2">
                Découvrir nos produits
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Sans engagement · Annulation gratuite · Livraison offerte dès 69€ TTC
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SubscriptionBenefits;
