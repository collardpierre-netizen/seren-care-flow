import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Clock, Share2, Printer, ArrowRight } from "lucide-react";

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string;
  read_time: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const GuideArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['guide', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data as Guide;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="bg-muted/30 py-4 border-b border-border">
          <div className="container-main">
            <Skeleton className="h-6 w-32" />
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container-main max-w-4xl">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !guide) {
    return (
      <Layout>
        <div className="container-main py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link to="/guides">
            <Button>Retour aux guides</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guide.title,
          text: guide.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <Helmet>
        <title>{guide.seo_title || guide.title} | SerenCare</title>
        <meta name="description" content={guide.seo_description || guide.excerpt || ''} />
        <meta property="og:title" content={guide.seo_title || guide.title} />
        <meta property="og:description" content={guide.seo_description || guide.excerpt || ''} />
        <meta property="og:type" content="article" />
        {guide.image_url && <meta property="og:image" content={guide.image_url} />}
      </Helmet>
      <Layout>
        {/* Breadcrumb */}
        <section className="bg-muted/30 py-4 border-b border-border">
          <div className="container-main">
            <Link 
              to="/guides" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour aux guides
            </Link>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-12 md:py-16">
          <div className="container-main max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-4">{guide.category}</Badge>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {guide.title}
              </h1>
              {guide.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">
                  {guide.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {guide.read_time && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {guide.read_time} de lecture
                  </span>
                )}
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        {guide.image_url && (
          <section className="pb-8">
            <div className="container-main max-w-4xl">
              <img
                src={guide.image_url}
                alt={guide.title}
                className="w-full rounded-xl object-cover max-h-96"
              />
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="pb-16 md:pb-24">
          <div className="container-main max-w-4xl">
            {guide.content ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-lg max-w-none 
                  prose-headings:font-display prose-headings:text-foreground prose-headings:mt-12 prose-headings:mb-6
                  prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-3
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                  prose-li:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline-offset-4
                  prose-table:my-8 prose-th:py-4 prose-td:py-3
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8"
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />
            ) : (
              <p className="text-muted-foreground">Contenu à venir...</p>
            )}

            {/* CTA */}
            <Card className="mt-16 bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Prêt à trouver votre produit ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Utilisez notre sélecteur de produits pour trouver la protection idéale.
                </p>
                <Link to="/boutique">
                  <Button className="gap-2">
                    Voir nos produits <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default GuideArticle;