import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useHeroMedia, type HeroMedia } from "@/hooks/useHeroMedia";
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

  // Preload next media when current changes
  useEffect(() => {
    if (heroMedia.length <= 1) return;
    
    const nextIndex = (currentMediaIndex + 1) % heroMedia.length;
    
    // Preload next image
    const nextItem = heroMedia[nextIndex];
    if (nextItem?.type === 'image') {
      const img = new Image();
      img.src = nextItem.src;
      img.onload = () => handleMediaLoad(nextIndex);
    }
  }, [currentMediaIndex, heroMedia, handleMediaLoad]);

  const handleVideoEnd = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length);
  };

  useEffect(() => {
    if (heroMedia.length <= 1) return;
    
    const currentItem = heroMedia[currentMediaIndex];
    if (!currentItem) return;
    
    // Only auto-advance for images, videos advance on end
    if (currentItem.type === "image") {
      const duration = currentItem.duration || 6000;
      console.log(`[HeroSection] Image ${currentMediaIndex}, will advance in ${duration}ms`);
      const timer = setTimeout(() => {
        console.log(`[HeroSection] Advancing from ${currentMediaIndex} to ${(currentMediaIndex + 1) % heroMedia.length}`);
        setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentMediaIndex, heroMedia]);

  // Reset index if media list changes
  useEffect(() => {
    if (currentMediaIndex >= heroMedia.length) {
      setCurrentMediaIndex(0);
    }
  }, [heroMedia.length, currentMediaIndex]);

  if (heroMedia.length === 0 && !isLoading) {
    return null;
  }

  const currentItem = heroMedia[currentMediaIndex];
  const variants = currentItem ? getTransitionVariants(currentItem.transition) : getTransitionVariants('fade');
  const isCurrentLoaded = loadedMedia.has(currentMediaIndex);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
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
                onEnded={handleVideoEnd}
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
                fetchPriority={currentMediaIndex === 0 ? "high" : "auto"}
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
          <button
            key={index}
            onClick={() => setCurrentMediaIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentMediaIndex 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Media ${index + 1}`}
          />
        ))}
      </div>

      <div className="container-main relative z-10">
        <div className="py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium text-white mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse-soft" />
              Livraison automatique • Sans engagement
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Votre confort intime,{" "}
              <span className="text-white/90">livré chez vous, sans stress.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed"
            >
              Choisissez les protections adaptées à votre proche. 
              Recevez-les automatiquement chaque mois. Plus de stress, plus de courses.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/boutique" className="gap-2">
                  Je choisis mes produits
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="heroSecondary" size="lg">
                <Link to="/aide-au-choix">
                  Aidez-moi à choisir
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
              {["Emballage discret", "Livraison gratuite dès 49€", "Modifiable à tout moment", "Accompagnement humain"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HeroSection;
