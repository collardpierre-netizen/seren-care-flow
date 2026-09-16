import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  /** Durée affichée uniquement si vérifiée à la source */
  duration?: string;
  thumbnail: string;
  brand: "TENA" | "Hartmann";
  externalUrl: string;
  category: string;
  /** La ressource demande la création d'un compte ou une connexion */
  requiresAccount?: boolean;
}

// Vidéos publiques de la chaîne officielle TENA France (durées relevées sur YouTube)
const tenaVideos: VideoTutorial[] = [
  {
    id: "tena-flex-proskin-standing",
    title: "Poser TENA Flex ProSkin sur une personne debout",
    description:
      "Technique de pose de TENA Flex ProSkin lorsque la personne peut rester debout.",
    duration: "1 min 17",
    thumbnail: "https://i.ytimg.com/vi/b6ibTw37sYY/hqdefault.jpg",
    brand: "TENA",
    externalUrl: "https://www.youtube.com/watch?v=b6ibTw37sYY",
    category: "Placement produit",
  },
  {
    id: "tena-flex-proskin-lying",
    title: "Poser TENA Flex ProSkin sur une personne allongée",
    description:
      "Technique de pose de TENA Flex ProSkin lorsque la personne reste allongée.",
    duration: "1 min 31",
    thumbnail: "https://i.ytimg.com/vi/_UXqcnzocBg/hqdefault.jpg",
    brand: "TENA",
    externalUrl: "https://www.youtube.com/watch?v=_UXqcnzocBg",
    category: "Placement produit",
  },
];

// Formations HARTMANN Academy : l'accès demande un compte
const hartmannVideos: VideoTutorial[] = [
  {
    id: "hartmann-mesure-hanche",
    title: "Comment mesurer le tour de hanche",
    description:
      "Formation vidéo sur la prise de mesure du tour de hanche pour choisir la bonne taille de protection.",
    thumbnail:
      "https://www.hartmann.info/-/media/country/website/academy/default/webinar-teaser-background-default-hartmann-cyan-1600x900px.png?h=182&iar=0&mw=324&w=324",
    brand: "Hartmann",
    externalUrl:
      "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/formation-video-comment-mesurer-correctement-le-tour-de-hanche",
    category: "Guide des tailles",
    requiresAccount: true,
  },
  {
    id: "hartmann-form",
    title: "MoliCare Premium Form - Application",
    description:
      "Formation vidéo sur l'application des protections anatomiques MoliCare® Premium Form.",
    thumbnail:
      "https://www.hartmann.info/-/media/country/website/academy/default/webinar-teaser-background-default-hartmann-cyan-1600x900px.png?h=182&iar=0&mw=324&w=324",
    brand: "Hartmann",
    externalUrl:
      "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/formation-video-comment-appliquer-les-protections-anatomiques-molicare-premium-form",
    category: "Placement produit",
    requiresAccount: true,
  },
];

interface DownloadableGuide {
  id: string;
  title: string;
  description: string;
  externalUrl: string;
  brand: string;
}

const downloadableGuides: DownloadableGuide[] = [
  {
    id: "hartmann-elastic",
    title: "MoliCare Premium Elastic - Instructions de pose",
    description:
      "Document illustré (PDF) présentant les étapes de pose du MoliCare Premium Elastic.",
    externalUrl:
      "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/instructions-de-pose-molicare-premium-elastic-slip",
    brand: "HARTMANN",
  },
];

interface VideoTutorialsProps {
  variant?: "grid" | "carousel";
  maxItems?: number;
  showTitle?: boolean;
}

const VideoTutorials = ({ showTitle = true }: VideoTutorialsProps) => {
  const VideoCard = ({ video, index }: { video: VideoTutorial; index: number }) => (
    <motion.a
      href={video.externalUrl}
      target="_blank"
      rel="noopener noreferrer external"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="overflow-hidden border-border hover:border-primary hover:shadow-lg transition-all h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-background/90 text-foreground text-xs">
              {video.category}
            </Badge>
          </div>
          {video.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/70 text-white text-xs">
                <Play className="w-3 h-3 mr-1" />
                {video.duration}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {video.requiresAccount && (
            <Badge variant="outline" className="mb-2 text-xs gap-1">
              <Lock className="w-3 h-3" />
              Inscription ou connexion requise
            </Badge>
          )}
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
            {video.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary min-h-[44px]">
            {video.requiresAccount ? "Accéder à la formation" : "Regarder la vidéo"}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </CardContent>
      </Card>
    </motion.a>
  );

  return (
    <section className="py-12 md:py-16">
      <div className="container-main">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge className="mb-4">Vidéos tutoriels</Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Apprenez les bonnes techniques
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les fabricants proposent des vidéos de formation pour vous aider à bien
              utiliser les produits. Ces liens ouvrent leurs sites officiels.
            </p>
          </motion.div>
        )}

        {/* TENA Section */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00A0D2] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              Vidéos TENA
            </h3>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://www.youtube.com/@LightsByTenaFrance"
                target="_blank"
                rel="noopener noreferrer external"
                className="gap-2 min-h-[44px]"
              >
                Voir la chaîne TENA France <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenaVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>

        {/* Hartmann Section */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003366] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              Formations HARTMANN
            </h3>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence"
                target="_blank"
                rel="noopener noreferrer external"
                className="gap-2 min-h-[44px]"
              >
                Voir tout <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Ces formations sont hébergées par HARTMANN Academy. La lecture demande la
            création d'un compte ou une connexion.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hartmannVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>

        {/* Guides à télécharger */}
        <div className="mt-12">
          <h3 className="font-display text-xl font-semibold text-foreground mb-6">
            Guides à télécharger
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloadableGuides.map((guide) => (
              <Card key={guide.id} className="border-border h-full">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {guide.brand} · Document
                    </Badge>
                    <h4 className="font-semibold text-foreground mb-2">{guide.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {guide.description}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={guide.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer external"
                        className="gap-2 min-h-[44px]"
                      >
                        Consulter le guide <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA to manufacturer sites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-muted/50 rounded-2xl text-center"
        >
          <p className="text-muted-foreground mb-4">
            Ces ressources sont hébergées par les fabricants, sur leurs propres sites.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <a
                href="https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/"
                target="_blank"
                rel="noopener noreferrer external"
                className="gap-2 min-h-[44px]"
              >
                Techniques de pose TENA <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence"
                target="_blank"
                rel="noopener noreferrer external"
                className="gap-2 min-h-[44px]"
              >
                HARTMANN Academy <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTutorials;
