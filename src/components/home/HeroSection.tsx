import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useMemo } from "react";
import { useHeroMedia } from "@/hooks/useHeroMedia";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback static media for initial render or if DB is empty
import heroImage1 from "@/assets/hero-1.jpeg";
import heroImage2 from "@/assets/hero-2.jpeg";
import heroVideo from "@/assets/hero-video.mov";

type MediaItem = {
  type: "image" | "video";
  src: string;
  duration: number | null;
  transition: "fade" | "zoom" | "slide";
  alt?: string | null;
  poster?: string;
};

const fallbackMedia: MediaItem[] = [
  { type: "video", src: heroVideo, duration: null, transition: "fade", poster: heroImage1 },
  { type: "image", src: heroImage1, duration: 6000, transition: "fade" },
  { type: "image", src: heroImage2, duration: 6000, transition: "fade" },
];

const getTransitionVariants = (effect: "fade" | "zoom" | "slide") => {
  switch (effect) {
    case "zoom":
      return {
        initial: { opacity: 0, scale: 1.2 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      };
    case "slide":
      return {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
      };
    case "fade":
    default:
      return {
        initial: { opacity: 0, scale: 1.05 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0 },
      };
  }
};

const HeroSection = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loadedMedia, setLoadedMedia] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: heroMediaFromDB, isLoading } = useHeroMedia();

  // Use DB media if available, otherwise fallback - memoized to prevent useEffect re-runs
  const heroMedia: MediaItem[] = useMemo(() => {
    if (heroMediaFromDB && heroMediaFromDB.length > 0) {
      return heroMediaFromDB.map((m, index) => ({
        type: m.type,
        src: m.file_url,
        duration: m.display_duration,
        transition: m.transition_effect,
        alt: m.alt_text,
        // Use first image as poster for videos
        poster: m.type === 'video' && heroMediaFromDB[index + 1]?.type === 'image' 
          ? heroMediaFromDB[index + 1].file_url 
          : undefined,
      }));
    }
    return fallbackMedia;
  }, [heroMediaFromDB]);

  // Mark media as loaded
  const handleMediaLoad = useCallback((index: number) => {
    setLoadedMedia(prev => new Set([...prev, index]));
  }, []);

  if (heroMedia.length === 0 && !isLoading) {
    return null;
  }

  const currentItem = heroMedia[currentMediaIndex];
  const variants = currentItem ? getTransitionVariants(currentItem.transition) : getTransitionVariants('fade');
  const isCurrentLoaded = loadedMedia.has(currentMediaIndex);

  return (
    <section className="relative overflow-hidden min-h-[calc(100svh-72px)] flex items-center">
      {/* Media Background Gallery */}
      <div className="absolute inset-0 z-0">
        {/* Loading skeleton - only show during initial load, not with partial content */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-muted animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {currentItem && (
            currentItem.type === "video" ? (
              <motion.video
                ref={videoRef}
                key={`video-${currentMediaIndex}`}
                src={currentItem.src}
                poster={currentItem.poster}
                autoPlay
                muted
                playsInline
                preload="auto"
                onLoadedData={() => handleMediaLoad(currentMediaIndex)}
                loop
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.img
                key={`image-${currentMediaIndex}`}
                src={currentItem.src}
                alt={currentItem.alt || "SerenCare"}
                loading="eager"
                onLoad={() => handleMediaLoad(currentMediaIndex)}
                initial={variants.initial}
                animate={isCurrentLoaded ? variants.animate : { opacity: 0 }}
                exit={variants.exit}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          )}
        </AnimatePresence>
        {/* Fallback loading placeholder */}
        {!isCurrentLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        {/* Color Overlay #0058A0 at 12% */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: "rgba(0, 88, 160, 0.12)" }} 
        />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Media indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroMedia.map((_, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMediaIndex(index)}
            className={`h-11 min-w-11 rounded-full transition-all duration-300 ${
              index === currentMediaIndex 
                ? "bg-primary-foreground/30" 
                : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
            }`}
            aria-label={`Afficher le média ${index + 1}`}
            aria-current={index === currentMediaIndex ? "true" : undefined}
          ><span className="block h-2 w-2 rounded-full bg-primary-foreground" /></Button>
        ))}
      </div>

      <div className="container-main relative z-10">
        <div className="py-10 md:py-20 lg:py-24">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium text-white mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse-soft" />
              Commande ponctuelle ou livraison régulière
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Les bonnes protections, livrées simplement et discrètement.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed"
            >
              Retrouvez une référence que vous connaissez déjà ou laissez-vous guider pour comparer les produits. Commandez pour vous-même ou faites livrer directement chez un proche.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
               <Button asChild variant="hero" size="lg" className="min-h-12 w-full sm:w-auto">
                 <Link to="/aide-au-choix" className="gap-2">
                   Trouver mes protections
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
               <Button asChild variant="heroSecondary" size="lg" className="min-h-12 w-full sm:w-auto">
                 <Link to="/boutique">
                   Je connais déjà mon produit
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 text-sm text-white/70"
            >
               {["Emballage discret", "Modification possible depuis votre compte", "Aide par téléphone"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
            <p className="mt-6 text-sm text-primary-foreground/90">
              Une question avant de commander ? <a href="tel:+3226484222" className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Appelez-nous au +32 2 648 42 22.</a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HeroSection;
