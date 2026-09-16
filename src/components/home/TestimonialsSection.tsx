import React from "react";
import { Search, ListChecks, MapPin, RefreshCw } from "lucide-react";

const reasons = [
  {
    icon: Search,
    title: "Recherche simplifiée",
    text: "Retrouvez un produit par marque, type ou référence.",
  },
  {
    icon: ListChecks,
    title: "Aide au choix",
    text: "Comparez les tailles, quantités et caractéristiques indiquées par les fabricants.",
  },
  {
    icon: MapPin,
    title: "Livraison organisée",
    text: "Choisissez l’adresse de livraison qui vous convient.",
  },
  {
    icon: RefreshCw,
    title: "Renouvellement flexible",
    text: "Sélectionnez une commande ponctuelle ou une livraison régulière lorsque cette option est disponible.",
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="why-created-title">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-12">
          <h2 id="why-created-title" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi SerenCare a été créé
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Choisir et recommander des protections pour adultes peut prendre du temps et soulever des questions très personnelles. SerenCare a été conçu pour rendre ce parcours plus simple : retrouver une référence, comparer les informations utiles et organiser une livraison adaptée à votre situation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((reason) => (
            <article key={reason.title} className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <reason.icon className="h-7 w-7 text-primary mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-foreground mb-2">{reason.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
