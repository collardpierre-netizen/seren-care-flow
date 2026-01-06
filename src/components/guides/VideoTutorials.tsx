import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl?: string;
  slug?: string;
}

const tutorials: VideoTutorial[] = [
  {
    id: "1",
    title: "Comment choisir la bonne taille ?",
    description: "Apprenez à mesurer correctement pour trouver la taille idéale de protection.",
    duration: "2:30",
    thumbnail: "/hero-1.jpeg",
    slug: "comment-choisir-la-bonne-taille",
  },
  {
    id: "2",
    title: "Comment mettre une protection ?",
    description: "Guide pas à pas pour positionner correctement une protection pour un confort optimal.",
    duration: "3:15",
    thumbnail: "/hero-2.jpeg",
    slug: "comment-mettre-une-protection",
  },
  {
    id: "3",
    title: "Comprendre les niveaux d'absorption",
    description: "Découvrez comment choisir le bon niveau d'absorption selon vos besoins.",
    duration: "2:00",
    thumbnail: "/hero-3.jpeg",
    slug: "comprendre-les-niveaux-dabsorption",
  },
  {
    id: "4",
    title: "Gérer son abonnement SerenCare",
    description: "Modifiez, pausez ou annulez votre abonnement en quelques clics.",
    duration: "1:45",
    thumbnail: "/hero-4.jpeg",
    slug: "gerer-son-abonnement",
  },
];

interface VideoTutorialsProps {
  variant?: "grid" | "carousel";
  maxItems?: number;
  showTitle?: boolean;
}

const VideoTutorials: React.FC<VideoTutorialsProps> = ({
  variant = "grid",
  maxItems,
  showTitle = true,
}) => {
  const displayedTutorials = maxItems ? tutorials.slice(0, maxItems) : tutorials;

  return (
    <section className="py-12 lg:py-20">
      <div className="container-main">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
              <Play className="w-4 h-4" />
              Vidéos tutoriels
            </div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nos guides en vidéo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des tutoriels simples et pratiques pour vous accompagner au quotidien.
            </p>
          </motion.div>
        )}

        <div className={`grid gap-6 ${
          variant === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
            : "grid-cols-1 md:grid-cols-2"
        }`}>
          {displayedTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={tutorial.slug ? `/guides/${tutorial.slug}` : "#"}
                className="group block"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-background/90 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-foreground/80 text-background text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </div>
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {tutorial.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <BookOpen className="w-4 h-4" />
            Voir tous nos guides
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTutorials;
