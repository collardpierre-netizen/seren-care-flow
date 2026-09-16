import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { ExternalLink, Shield, Leaf, Heart, Award, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import lilleLogo from "@/assets/lille-logo.png";
import hartmannLogo from "@/assets/hartmann-logo.png";
import tenaLogo from "@/assets/tena-logo.png";

const brands = [
  {
    name: "Lille Healthcare",
    slug: "lille",
    logo: lilleLogo,
    tagline: "Protections absorbantes",
    description: "Retrouvez les références Lille Healthcare proposées par SerenCare et comparez leurs formats et caractéristiques fabricant.",
    values: [
      { icon: Award, label: "Formats disponibles" },
      { icon: Shield, label: "Tailles indiquées" },
      { icon: Leaf, label: "Informations fabricant" },
    ],
    highlights: [
      "Références disponibles dans la boutique",
      "Conditionnements indiqués sur chaque fiche",
      "Caractéristiques fournies par le fabricant",
    ],
    website: "https://lillehealthcare.com/fr/",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    name: "Hartmann",
    slug: "hartmann",
    logo: hartmannLogo,
    tagline: "Aide. Prend soin. Protège.",
    description: "Retrouvez les références Hartmann proposées par SerenCare et comparez leurs formats et caractéristiques fabricant.",
    values: [
      { icon: Heart, label: "Formats disponibles" },
      { icon: Building2, label: "Tailles indiquées" },
      { icon: Users, label: "Informations fabricant" },
    ],
    highlights: [
      "Références disponibles dans la boutique",
      "Conditionnements indiqués sur chaque fiche",
      "Caractéristiques fournies par le fabricant",
    ],
    website: "https://www.hartmann.info/fr-be/",
    color: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    name: "TENA",
    slug: "tena",
    logo: tenaLogo,
    tagline: "De meilleurs soins pour tous",
    description: "Retrouvez les références TENA proposées par SerenCare et comparez leurs formats et caractéristiques fabricant.",
    values: [
      { icon: Award, label: "Formats disponibles" },
      { icon: Shield, label: "Tailles indiquées" },
      { icon: Leaf, label: "Informations fabricant" },
    ],
    highlights: [
      "Références disponibles dans la boutique",
      "Conditionnements indiqués sur chaque fiche",
      "Caractéristiques fournies par le fabricant",
    ],
    website: "https://www.tena.be/fr/professionnels/",
    color: "from-violet-500/10 to-violet-600/5",
  },
];

const Brands = () => {
  return (
    <>
      <Helmet>
        <title>Nos Marques - Lille, Hartmann, TENA | SerenCare</title>
        <meta 
          name="description" 
          content="Retrouvez les produits Lille Healthcare, Hartmann et TENA et comparez les formats disponibles." 
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
                 Marques disponibles
              </p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                 Des marques spécialisées,
                <br />
                 <span className="text-primary">des informations à comparer.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                 Retrouvez des produits TENA, Hartmann et Lille Healthcare. Consultez les caractéristiques de chaque référence pour comparer les formats disponibles.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Brands Grid */}
        <section className="section-padding">
          <div className="container-main">
            <div className="space-y-12">
              {brands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${brand.color} rounded-3xl border border-border overflow-hidden`}
                >
                  <div className="grid lg:grid-cols-3 gap-8 p-8 md:p-10">
                    {/* Logo & Info */}
                    <div className="lg:col-span-1">
                      <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50 mb-6">
                        <img 
                          src={brand.logo} 
                          alt={`Logo ${brand.name}`}
                          className="h-12 md:h-16 object-contain mx-auto"
                        />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                        {brand.name}
                      </h2>
                      <p className="text-primary font-medium text-sm mb-4">
                        {brand.tagline}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild size="sm" className="min-h-[44px]">
                          <Link to={`/marque/${brand.slug}`}>
                            Voir les produits {brand.name}
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-2 min-h-[44px]">
                          <a href={brand.website} target="_blank" rel="noopener noreferrer">
                            Visiter le site
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Description & Values */}
                    <div className="lg:col-span-2">
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {brand.description}
                      </p>

                      {/* Values */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {brand.values.map((value) => (
                          <div 
                            key={value.label}
                            className="flex items-center gap-2 bg-background/80 rounded-full px-4 py-2 text-sm"
                          >
                            <value.icon className="w-4 h-4 text-primary" />
                            <span className="text-foreground font-medium">{value.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Highlights */}
                      <div className="grid sm:grid-cols-3 gap-3">
                        {brand.highlights.map((highlight) => (
                          <div 
                            key={highlight}
                            className="bg-background/60 rounded-xl p-4 text-center"
                          >
                            <p className="text-sm text-foreground font-medium">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Besoin d'aide pour choisir ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe d'experts vous accompagne pour trouver la protection 
                idéale parmi nos marques partenaires.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/aide-au-choix">
                    Faire le test
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">
                    Nous contacter
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Brands;
