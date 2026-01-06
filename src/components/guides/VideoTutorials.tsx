import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  brand: "TENA" | "Hartmann";
  externalUrl: string;
  category: string;
}

const videoTutorials: VideoTutorial[] = [
  // TENA Videos
  {
    id: "tena-flex-improvements",
    title: "TENA ProSkin Flex - Améliorations",
    description: "Découvrez les dernières améliorations de TENA ProSkin Flex : la languette FingerLift™ et la ceinture COMFIStretch™.",
    duration: "3 min",
    thumbnail: "https://tena-images.essity.com/images-c5/335/391335/original/fitting-flex-improvements-apr22-thumnail-500x250.jpg",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-flex-laying-front",
    title: "TENA ProSkin Flex - Position allongée (avant)",
    description: "Notice d'utilisation pour la mise en place de TENA ProSkin Flex sur un utilisateur en position allongée avec fermeture avant.",
    duration: "4 min",
    thumbnail: "https://tena-images.essity.com/images-c5/341/391341/original/fitting-flex-laying-front-thumnail-500x250.jpg",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-flex-laying-back",
    title: "TENA ProSkin Flex - Position allongée (arrière)",
    description: "Notice d'utilisation pour la mise en place de TENA ProSkin Flex sur un utilisateur en position allongée avec fermeture arrière.",
    duration: "4 min",
    thumbnail: "https://tena-images.essity.com/images-c5/340/391340/original/fitting-flex-laying-back-thumnail-500x250.jpg",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-flex-standing",
    title: "TENA ProSkin Flex - Position debout",
    description: "Instructions pour appliquer TENA ProSkin Flex debout. Application depuis l'avant ou l'arrière de la personne.",
    duration: "3 min",
    thumbnail: "https://tena-images.essity.com/images-c5/339/391339/original/fitting-flex-standing-back-thumnail-500x250.jpg",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-slip",
    title: "TENA Slip - Mise en place",
    description: "Notice d'utilisation pour la mise en place de TENA Slip sur un utilisateur en position debout.",
    duration: "3 min",
    thumbnail: "https://tena-images.essity.com/images-c5/50/85050/optimized-AzureJPG2K/210-view-fitting-application-guides-tena-slip-1.jpg?w=500&h=250&imPolicy=dynamic",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-comfort",
    title: "TENA Comfort - Mise en place",
    description: "Notice d'utilisation pour la mise en place de TENA Comfort sur un utilisateur en position debout ou allongée.",
    duration: "4 min",
    thumbnail: "https://tena-images.essity.com/images-c5/17/85017/optimized-AzurePNG2K/210-view-fitting--application-guides-tena-comfort-1.png?w=500&h=250&imPolicy=dynamic",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  {
    id: "tena-pants",
    title: "TENA Pants - Mise en place",
    description: "Notice d'utilisation pour la mise en place de la culotte TENA Pants sur un utilisateur.",
    duration: "2 min",
    thumbnail: "https://tena-images.essity.com/images-c5/49/85049/optimized-AzureJPG2K/210-view-fitting-application-guides-tena-pants.jpg?w=500&h=250&imPolicy=dynamic",
    brand: "TENA",
    externalUrl: "https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/",
    category: "Placement produit"
  },
  // Hartmann Videos
  {
    id: "hartmann-mesure-hanche",
    title: "Comment mesurer le tour de hanche",
    description: "Formation vidéo sur la prise de mesure correcte du tour de hanche pour choisir la bonne taille de protection.",
    duration: "5 min",
    thumbnail: "https://www.hartmann.info/-/media/country/website/academy/default/webinar-teaser-background-default-hartmann-cyan-1600x900px.png?h=182&iar=0&mw=324&w=324",
    brand: "Hartmann",
    externalUrl: "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/formation-video-comment-mesurer-correctement-le-tour-de-hanche",
    category: "Guide des tailles"
  },
  {
    id: "hartmann-form",
    title: "MoliCare Premium Form - Application",
    description: "Formation vidéo sur l'application des protections anatomiques MoliCare® Premium Form.",
    duration: "6 min",
    thumbnail: "https://www.hartmann.info/-/media/country/website/academy/default/webinar-teaser-background-default-hartmann-cyan-1600x900px.png?h=182&iar=0&mw=324&w=324",
    brand: "Hartmann",
    externalUrl: "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/formation-video-comment-appliquer-les-protections-anatomiques-molicare-premium-form",
    category: "Placement produit"
  },
  {
    id: "hartmann-elastic",
    title: "MoliCare Premium Elastic - Instructions",
    description: "Instructions de pose MoliCare Premium Elastic - slip pour une application optimale.",
    duration: "5 min",
    thumbnail: "https://www.hartmann.info/-/media/country/website/academy/default/library-teaser-background-default-hartmann-dark-blue_1600x900px.png?h=182&iar=0&mw=324&w=324",
    brand: "Hartmann",
    externalUrl: "https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence/2024/instructions-de-pose-molicare-premium-elastic-slip",
    category: "Placement produit"
  },
];

interface VideoTutorialsProps {
  variant?: "grid" | "carousel";
  maxItems?: number;
  showTitle?: boolean;
}

const VideoTutorials = ({
  showTitle = true,
}: VideoTutorialsProps) => {
  const tenaVideos = videoTutorials.filter(v => v.brand === "TENA");
  const hartmannVideos = videoTutorials.filter(v => v.brand === "Hartmann");

  const VideoCard = ({ video, index }: { video: VideoTutorial; index: number }) => (
    <motion.a
      href={video.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group block"
    >
      <Card className="overflow-hidden border-border hover:border-primary hover:shadow-lg transition-all h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 text-foreground text-xs">
              {video.category}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/70 text-white text-xs">
              <Play className="w-3 h-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {video.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
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
              Nos partenaires fabricants proposent des vidéos de formation professionnelles 
              pour vous aider à bien utiliser les produits.
            </p>
          </motion.div>
        )}

        {/* TENA Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00A0D2] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              Vidéos TENA
            </h3>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                Voir tout <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tenaVideos.slice(0, 4).map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>

        {/* Hartmann Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003366] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              Vidéos Hartmann
            </h3>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                Voir tout <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hartmannVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
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
            Ces vidéos sont hébergées par nos partenaires fabricants. 
            Cliquez sur une vidéo pour accéder à leur plateforme de formation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <a 
                href="https://www.tena.be/fr/professionnels/outils-de-soutien/education/les-techniques-de-mise-en-place/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                Formation TENA <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a 
                href="https://www.hartmann.info/fr-be/apprendre-et-savoir/gestion-de-lincontinence" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
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
