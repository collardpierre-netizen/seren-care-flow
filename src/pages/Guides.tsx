import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VideoTutorials from "@/components/guides/VideoTutorials";

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  read_time: string | null;
}

const Guides = () => {
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('id, slug, title, excerpt, image_url, category, read_time')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Guide[];
    },
  });

  const featuredGuide = guides[0];
  const otherGuides = guides.slice(1);

  return (
    <>
      <Helmet>
        <title>Guides & Conseils - Incontinence | SerenCare</title>
        <meta name="description" content="Guides pratiques pour bien choisir vos protections incontinence. Conseils d'experts, tailles, types de produits et soins de la peau." />
        <meta name="keywords" content="incontinence, protection, guide, conseils, taille, absorption, santé" />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="mb-4">Ressources</Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Guides & Conseils
              </h1>
              <p className="text-xl text-muted-foreground">
                Tout ce que vous devez savoir pour bien choisir et utiliser vos protections. 
                Des conseils d'experts pour améliorer votre quotidien.
              </p>
            </motion.div>
          </div>
        </section>

        {isLoading ? (
          <section className="py-12 md:py-16">
            <div className="container-main">
              <Skeleton className="h-64 w-full mb-8" />
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            </div>
          </section>
        ) : guides.length === 0 ? (
          <section className="py-16 md:py-24">
            <div className="container-main text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Aucun guide disponible</h2>
              <p className="text-muted-foreground">Revenez bientôt pour découvrir nos conseils.</p>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Article */}
            {featuredGuide && (
              <section className="py-12 md:py-16">
                <div className="container-main">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link to={`/guides/${featuredGuide.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            {featuredGuide.image_url ? (
                              <img
                                src={featuredGuide.image_url}
                                alt={featuredGuide.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-24 h-24 text-primary/40" />
                            )}
                          </div>
                          <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                            <Badge className="w-fit mb-4">{featuredGuide.category}</Badge>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                              {featuredGuide.title}
                            </h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                              {featuredGuide.excerpt}
                            </p>
                            <div className="flex items-center gap-4">
                              {featuredGuide.read_time && (
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {featuredGuide.read_time} de lecture
                                </span>
                              )}
                              <span className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                Lire l'article <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                </div>
              </section>
            )}

            {/* Other Articles */}
            {otherGuides.length > 0 && (
              <section className="py-12 md:py-16 bg-muted/30">
                <div className="container-main">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                    Tous nos guides
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherGuides.map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <Link to={`/guides/${guide.slug}`}>
                          <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                              {guide.image_url ? (
                                <img
                                  src={guide.image_url}
                                  alt={guide.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-16 h-16 text-primary/30" />
                              )}
                            </div>
                            <CardContent className="p-6">
                              <Badge variant="outline" className="mb-3">{guide.category}</Badge>
                              <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {guide.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {guide.excerpt}
                              </p>
                              <div className="flex items-center justify-between">
                                {guide.read_time && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {guide.read_time}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                                  Lire <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Video Tutorials Section */}
        <div className="bg-muted/20">
          <VideoTutorials maxItems={4} />
        </div>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Besoin d'aide personnalisée ?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                Notre équipe est disponible pour vous accompagner dans le choix de vos produits. 
                Demandez un rappel gratuit.
              </p>
              <Link 
                to="/contact"
                className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 rounded-xl font-medium hover:bg-background/90 transition-colors"
              >
                Nous contacter <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Guides;
