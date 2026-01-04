import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Phone, ClipboardList, ArrowRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import CallbackFormCompact from "@/components/CallbackFormCompact";

import guidedChoiceVideo from "@/assets/guided-choice-video.mov";
import guidedChoiceImage1 from "@/assets/guided-choice-1.jpeg";
import guidedChoiceImage2 from "@/assets/guided-choice-2.jpeg";

type MediaItem = {
  type: "video" | "image";
  src: string;
};

const heroMedia: MediaItem[] = [
  { type: "video", src: guidedChoiceVideo },
  { type: "image", src: guidedChoiceImage1 },
  { type: "image", src: guidedChoiceImage2 },
];

const GuidedChoice = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const handleVideoEnd = () => {
    setVideoPlayed(true);
    setCurrentMediaIndex(1); // Move to first image after video
  };

  useEffect(() => {
    const currentItem = heroMedia[currentMediaIndex];
    // Only auto-advance for images (skip video index 0 if already played)
    if (currentItem.type === "image") {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => {
          const next = prev + 1;
          // Skip video (index 0) if already played
          if (next >= heroMedia.length) {
            return videoPlayed ? 1 : 0;
          }
          return next;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentMediaIndex, videoPlayed]);

  const currentItem = heroMedia[currentMediaIndex];

  return (
    <>
      <Helmet>
        <title>Aide au choix - SerenCare</title>
        <meta name="description" content="Pas sûr de ce dont vous avez besoin ? Répondez à quelques questions ou appelez-nous. Nous vous aidons à trouver la protection adaptée." />
      </Helmet>
      <Layout>
        {/* Hero with Media Zone */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container-main">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight text-sm font-medium text-primary mb-6">
                  <Heart className="w-4 h-4" />
                  Nous sommes là pour vous
                </div>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Choisir pour un proche,
                  <span className="text-primary"> c'est normal d'hésiter.</span>
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Vous n'êtes pas seul. Notre équipe vous guide pour trouver la protection adaptée, 
                  sans pression, sans jargon médical.
                </p>
              </motion.div>

              {/* Right: Media Zone with Slideshow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <AnimatePresence mode="wait">
                    {currentItem.type === "video" ? (
                      <motion.video
                        key="video"
                        src={currentItem.src}
                        autoPlay
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                      />
                    ) : (
                      <motion.img
                        key={`image-${currentMediaIndex}`}
                        src={currentItem.src}
                        alt="Accompagnement personnalisé"
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                      />
                    )}
                  </AnimatePresence>
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                </div>
                
                {/* Slideshow indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {heroMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentMediaIndex
                          ? "bg-primary w-6"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Aller au média ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Two Options */}
        <section className="section-padding">
          <div className="container-main">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Comment préférez-vous être accompagné ?
                </h2>
                <p className="text-muted-foreground">
                  Deux options simples pour trouver ce qu'il vous faut.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Questionnaire Option */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <ClipboardList className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Questionnaire guidé
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>2 minutes</span>
                  </div>

                  <p className="text-muted-foreground mb-6 flex-1">
                    5 questions simples. Nous vous recommandons les produits les plus adaptés.
                  </p>

                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Questions claires, sans jargon",
                      "Recommandation personnalisée",
                      "Ajustable à tout moment",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button asChild size="lg" className="w-full">
                    <Link to="/questionnaire" className="gap-2">
                      Commencer
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Callback Option */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-primary rounded-2xl p-8 shadow-lg flex flex-col"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-6">
                    <Phone className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
                    Parler à quelqu'un
                  </h3>

                  <p className="text-primary-foreground/80 mb-6">
                    Préférez discuter ? Laissez-nous vos coordonnées, nous vous rappelons.
                  </p>

                  <CallbackFormCompact variant="light" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Reassurance */}
        <section className="py-16 bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
                Une chose importante
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Quoi que vous choisissiez, vous pourrez toujours ajuster ensuite. 
                Changer de produit, de quantité, de fréquence. Sans frais, sans justification.
              </p>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default GuidedChoice;
