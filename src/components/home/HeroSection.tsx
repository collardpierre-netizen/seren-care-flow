import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const videoUrls = [
  "https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4",
  "https://videos.pexels.com/video-files/3195440/3195440-uhd_2560_1440_25fps.mp4",
  "https://videos.pexels.com/video-files/3192584/3192584-uhd_2560_1440_25fps.mp4",
];

const HeroSection = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background Gallery */}
      <div className="absolute inset-0 z-0">
        {videoUrls.map((url, index) => (
          <video
            key={url}
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentVideoIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Color Overlay #0058A0 at 12% */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: "rgba(0, 88, 160, 0.12)" }} 
        />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Video indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {videoUrls.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideoIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentVideoIndex 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Vidéo ${index + 1}`}
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
              La tranquillité d'esprit,{" "}
              <span className="text-white/90">livrée chez vous.</span>
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
              {["Livraison gratuite", "Modifiable à tout moment", "Accompagnement humain"].map((item) => (
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
