import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Droplet, Ruler, ShieldCheck, HelpCircle } from "lucide-react";

const articles = [
  {
    slug: "comment-choisir-le-bon-produit",
    title: "Comment choisir le bon produit d'incontinence ?",
    excerpt: "Découvrez les critères essentiels pour sélectionner la protection adaptée : niveau d'absorption, type de produit, morphologie et mode de vie.",
    image: "/placeholder.svg",
    readTime: "5 min",
    category: "Guide pratique",
    icon: Droplet,
    featured: true,
  },
  {
    slug: "comment-choisir-la-bonne-taille",
    title: "Comment choisir la bonne taille ?",
    excerpt: "Un guide complet pour mesurer et déterminer la taille idéale. Une protection bien ajustée garantit confort et efficacité.",
    image: "/placeholder.svg",
    readTime: "4 min",
    category: "Guide taille",
    icon: Ruler,
  },
  {
    slug: "types-incontinence",
    title: "Comprendre les différents types d'incontinence",
    excerpt: "Incontinence urinaire, fécale, d'effort ou par urgenturie : apprenez à identifier le type pour mieux le gérer au quotidien.",
    image: "/placeholder.svg",
    readTime: "6 min",
    category: "Santé",
    icon: HelpCircle,
  },
  {
    slug: "conseils-peau-saine",
    title: "Préserver la santé de la peau",
    excerpt: "La peau fragile nécessite des soins adaptés. Nos conseils pour éviter les irritations et maintenir une peau saine.",
    image: "/placeholder.svg",
    readTime: "4 min",
    category: "Bien-être",
    icon: ShieldCheck,
  },
];

const Guides = () => {
  const featuredArticle = articles.find(a => a.featured);
  const otherArticles = articles.filter(a => !a.featured);

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

        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-12 md:py-16">
            <div className="container-main">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link to={`/guides/${featuredArticle.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <featuredArticle.icon className="w-24 h-24 text-primary/40" />
                      </div>
                      <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                        <Badge className="w-fit mb-4">{featuredArticle.category}</Badge>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-muted-foreground mb-6 text-lg">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {featuredArticle.readTime} de lecture
                          </span>
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
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container-main">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Tous nos guides
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article, index) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Link to={`/guides/${article.slug}`}>
                    <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <article.icon className="w-16 h-16 text-primary/30" />
                      </div>
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">{article.category}</Badge>
                        <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
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
