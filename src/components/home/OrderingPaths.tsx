import { Link } from "react-router-dom";
import { ArrowRight, Search, ListChecks, HeartHandshake } from "lucide-react";

const paths = [
  {
    icon: Search,
    title: "Je connais déjà mon produit",
    description: "Recherchez une marque, une référence ou un type de protection.",
    action: "Accéder à la boutique",
    to: "/boutique",
  },
  {
    icon: ListChecks,
    title: "J’ai besoin d’aide pour choisir",
    description: "Répondez à quelques questions pour obtenir une sélection à comparer.",
    action: "Commencer le guide",
    to: "/aide-au-choix",
  },
  {
    icon: HeartHandshake,
    title: "Je commande pour un proche",
    description: "Choisissez les produits et indiquez directement l’adresse de livraison du proche.",
    action: "Voir comment ça fonctionne",
    to: "#commande-proche",
  },
];

const OrderingPaths = () => (
  <section className="section-padding bg-background" aria-labelledby="ordering-paths-title">
    <div className="container-main">
      <h2 id="ordering-paths-title" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10">
        Comment souhaitez-vous commander ?
      </h2>
      <div className="grid gap-5 md:grid-cols-3">
        {paths.map((path) => (
          <Link
            key={path.title}
            to={path.to}
            className="group flex min-h-56 flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <path.icon className="h-8 w-8 text-primary" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-bold text-foreground">{path.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{path.description}</p>
            <span className="mt-auto pt-6 inline-flex items-center gap-2 font-semibold text-primary">
              {path.action}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default OrderingPaths;