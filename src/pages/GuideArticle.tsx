import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Share2, Printer, Droplet, Ruler, CheckCircle2, ArrowRight } from "lucide-react";

const articlesContent: Record<string, {
  title: string;
  description: string;
  readTime: string;
  category: string;
  sections: Array<{
    title: string;
    content: string;
    list?: string[];
  }>;
}> = {
  "comment-choisir-le-bon-produit": {
    title: "Comment choisir le bon produit d'incontinence ?",
    description: "Guide complet pour sélectionner la protection adaptée à vos besoins. Niveau d'absorption, type de produit et critères de choix.",
    readTime: "5 min",
    category: "Guide pratique",
    sections: [
      {
        title: "Évaluer le niveau d'incontinence",
        content: "La première étape consiste à évaluer la quantité et la fréquence des fuites. Cela déterminera le niveau d'absorption nécessaire.",
        list: [
          "Légère : quelques gouttes occasionnelles",
          "Modérée : fuites régulières mais contrôlables",
          "Forte : fuites fréquentes et importantes",
          "Très forte : incontinence totale ou quasi-totale"
        ]
      },
      {
        title: "Choisir le type de produit",
        content: "Selon votre niveau de mobilité et vos préférences, différents types de produits s'offrent à vous.",
        list: [
          "Protège-slips et serviettes : pour l'incontinence légère",
          "Culottes absorbantes (pants) : pour les personnes mobiles",
          "Changes complets : pour l'incontinence forte ou la nuit",
          "Protections anatomiques : à utiliser avec un slip filet"
        ]
      },
      {
        title: "Considérer le mode de vie",
        content: "Votre quotidien influence le choix du produit. Une personne active aura des besoins différents d'une personne à mobilité réduite.",
        list: [
          "Activité physique régulière : privilégier les produits discrets et ajustés",
          "Travail sédentaire : confort et discrétion avant tout",
          "Mobilité réduite : facilité de mise en place importante",
          "Nuit : absorption renforcée et maintien optimal"
        ]
      },
      {
        title: "Vérifier l'ajustement",
        content: "Un produit bien ajusté est essentiel pour éviter les fuites et garantir le confort. Prenez vos mesures et consultez les guides de tailles."
      }
    ]
  },
  "comment-choisir-la-bonne-taille": {
    title: "Comment choisir la bonne taille ?",
    description: "Un guide pratique pour mesurer et sélectionner la taille idéale de vos protections pour un confort optimal.",
    readTime: "4 min",
    category: "Guide taille",
    sections: [
      {
        title: "Pourquoi la taille est importante",
        content: "Une protection à la bonne taille garantit un ajustement optimal, prévient les fuites et assure un confort maximal tout au long de la journée."
      },
      {
        title: "Comment mesurer le tour de hanches",
        content: "Placez un mètre ruban autour de la partie la plus large des hanches, en passant par le haut des fesses. Gardez le mètre bien horizontal et ne serrez pas trop.",
        list: [
          "Tenez-vous debout, détendu(e)",
          "Mesurez sur les sous-vêtements ou peau nue",
          "Notez la mesure en centimètres",
          "Comparez avec le tableau des tailles du produit"
        ]
      },
      {
        title: "Tableau des tailles standard",
        content: "Les tailles peuvent varier selon les marques. Voici les correspondances moyennes :",
        list: [
          "S/Small : 60-80 cm de tour de hanches",
          "M/Medium : 80-110 cm de tour de hanches",
          "L/Large : 100-135 cm de tour de hanches",
          "XL/Extra Large : 130-170 cm de tour de hanches"
        ]
      },
      {
        title: "En cas de doute",
        content: "Si vous êtes entre deux tailles, préférez la taille supérieure pour plus de confort. N'hésitez pas à essayer différentes marques car les coupes varient."
      }
    ]
  },
  "types-incontinence": {
    title: "Comprendre les différents types d'incontinence",
    description: "Découvrez les différentes formes d'incontinence pour mieux comprendre et gérer cette condition au quotidien.",
    readTime: "6 min",
    category: "Santé",
    sections: [
      {
        title: "L'incontinence d'effort",
        content: "Des fuites surviennent lors d'efforts physiques comme tousser, rire, éternuer ou faire du sport. Le plancher pelvien affaibli ne retient plus l'urine lors de ces pressions."
      },
      {
        title: "L'incontinence par urgenturie",
        content: "Aussi appelée « vessie hyperactive », elle se caractérise par des envies soudaines et pressantes d'uriner, parfois accompagnées de fuites avant d'atteindre les toilettes."
      },
      {
        title: "L'incontinence mixte",
        content: "Combinaison de l'incontinence d'effort et par urgenturie. C'est la forme la plus courante chez les femmes."
      },
      {
        title: "L'incontinence par regorgement",
        content: "La vessie ne se vide pas complètement, provoquant des fuites goutte à goutte. Plus fréquente chez les hommes ayant des problèmes de prostate."
      },
      {
        title: "L'incontinence fécale",
        content: "Perte involontaire de selles. Elle peut être associée à l'incontinence urinaire et nécessite des protections adaptées."
      }
    ]
  },
  "conseils-peau-saine": {
    title: "Préserver la santé de la peau",
    description: "Conseils essentiels pour maintenir une peau saine malgré le port de protections absorbantes.",
    readTime: "4 min",
    category: "Bien-être",
    sections: [
      {
        title: "Changer régulièrement les protections",
        content: "Ne gardez pas une protection humide trop longtemps. Changez-la dès qu'elle est souillée pour éviter macération et irritations.",
        list: [
          "Toutes les 3-4 heures en journée",
          "Dès que la protection est humide",
          "Au réveil après la nuit"
        ]
      },
      {
        title: "Nettoyer la peau en douceur",
        content: "Utilisez des produits adaptés : lingettes sans alcool, lotions nettoyantes douces ou eau tiède. Séchez en tamponnant, sans frotter."
      },
      {
        title: "Protéger avec des crèmes barrières",
        content: "Appliquez une crème protectrice à base d'oxyde de zinc pour créer une barrière contre l'humidité et prévenir les rougeurs."
      },
      {
        title: "Surveiller les signes d'alerte",
        content: "Consultez un professionnel de santé si vous observez :",
        list: [
          "Rougeurs persistantes",
          "Lésions ou plaies",
          "Démangeaisons importantes",
          "Changement de couleur de la peau"
        ]
      }
    ]
  }
};

const GuideArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articlesContent[slug] : null;

  if (!article) {
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

  return (
    <>
      <Helmet>
        <title>{article.title} | SerenCare</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
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
              <Badge className="mb-4">{article.category}</Badge>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {article.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {article.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.readTime} de lecture
                </span>
                <button className="flex items-center gap-2 hover:text-foreground transition-colors">
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

        {/* Article Content */}
        <section className="pb-16 md:pb-24">
          <div className="container-main max-w-4xl">
            <div className="space-y-12">
              {article.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {section.content}
                  </p>
                  {section.list && (
                    <ul className="space-y-2">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>

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
