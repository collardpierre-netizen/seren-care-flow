import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marie D.",
    location: "Bruxelles",
    rating: 5,
    text: "Je commande pour ma maman de 82 ans. Avant, c'était la corvée en pharmacie, avec le regard des gens… Maintenant tout arrive à la maison, dans un colis discret. Elle est ravie et moi aussi.",
    highlight: "colis discret",
  },
  {
    name: "Philippe L.",
    location: "Liège",
    rating: 5,
    text: "Après l'opération de la prostate, j'avais besoin de protections sans que tout le voisinage le sache. L'emballage neutre et la livraison à domicile, c'est exactement ce qu'il me fallait.",
    highlight: "emballage neutre",
  },
  {
    name: "Catherine V.",
    location: "Namur",
    rating: 5,
    text: "J'ai pu modifier la taille après la première livraison, sans aucun souci. Le service client m'a rappelée dans l'heure. On sent que c'est une équipe humaine derrière.",
    highlight: "service client réactif",
  },
  {
    name: "Jean-Marc B.",
    location: "Gand",
    rating: 4,
    text: "Mon père refusait de porter des protections. Grâce au questionnaire de SerenCare, on a trouvé un modèle fin et confortable qu'il accepte de porter. Un vrai soulagement pour toute la famille.",
    highlight: "confort accepté",
  },
  {
    name: "Isabelle R.",
    location: "Charleroi",
    rating: 5,
    text: "10% d'économie par rapport à la pharmacie, la livraison gratuite, et je n'ai plus à y penser : tout arrive automatiquement. Je recommande à 100%.",
    highlight: "économies réelles",
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des familles en Belgique nous font confiance chaque jour
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-medium text-foreground">4.8/5</span>
            <span className="text-sm text-muted-foreground ml-1">— basé sur nos premiers clients</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-4">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  {t.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
