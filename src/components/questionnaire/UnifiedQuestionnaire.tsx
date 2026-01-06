import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check, X, Droplet, User, Users, Sun, Moon, Footprints, Armchair, BedDouble, RefreshCw, Package, Truck, Heart } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { useUserPreferences, mapProfileToFilters } from "@/hooks/useUserPreferences";

interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  drops?: number;
}

interface Question {
  id: string;
  question: string;
  subtext: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: "gender",
    question: "Pour qui recherchez-vous ?",
    subtext: "Certains produits sont adaptés à l'anatomie masculine ou féminine.",
    options: [
      { id: "male", label: "Un homme", icon: User },
      { id: "female", label: "Une femme", icon: User },
      { id: "any", label: "Peu importe", icon: Users },
    ],
  },
  {
    id: "mobility",
    question: "Comment se déplace la personne au quotidien ?",
    subtext: "Cela nous aide à choisir le type de protection le plus adapté.",
    options: [
      { id: "mobile", label: "Marche sans aide", description: "Se déplace librement", icon: Footprints },
      { id: "reduced", label: "A besoin d'aide", description: "Canne, déambulateur ou aide d'un proche", icon: Armchair },
      { id: "bedridden", label: "Reste principalement au lit", description: "Mobilité très réduite", icon: BedDouble },
    ],
  },
  {
    id: "incontinenceLevel",
    question: "Quel est le niveau de fuites ?",
    subtext: "Il n'y a pas de mauvaise réponse, cela nous aide à recommander l'absorption adaptée.",
    options: [
      { id: "light", label: "Quelques gouttes parfois", description: "Moins d'une fois par jour", drops: 1 },
      { id: "moderate", label: "Plusieurs fois par jour", description: "Des fuites régulières", drops: 2 },
      { id: "heavy", label: "Fuites importantes", description: "Protection nécessaire en continu", drops: 3 },
      { id: "very_heavy", label: "Incontinence complète", description: "Jour et nuit", drops: 4 },
    ],
  },
  {
    id: "usageTime",
    question: "À quel moment les fuites sont-elles les plus fréquentes ?",
    subtext: "Les besoins peuvent varier entre le jour et la nuit.",
    options: [
      { id: "day", label: "Principalement la journée", description: "Pendant les activités", icon: Sun },
      { id: "night", label: "Principalement la nuit", description: "Pendant le sommeil", icon: Moon },
      { id: "day_night", label: "Les deux", description: "Jour et nuit", icon: Sun },
    ],
  },
  {
    id: "priority",
    question: "Qu'est-ce qui compte le plus ?",
    subtext: "Il n'y a pas de mauvaise priorité.",
    options: [
      { id: "comfort", label: "Le confort", description: "Douceur et bien-être" },
      { id: "discretion", label: "La discrétion", description: "Que ça ne se voit pas" },
      { id: "safety", label: "La sécurité", description: "Éviter les fuites" },
    ],
  },
];

interface UnifiedQuestionnaireProps {
  variant?: "page" | "modal";
  onClose?: () => void;
  onFiltersApply?: (filters: {
    gender?: string;
    usageTime?: string;
    mobility?: string;
    incontinenceLevel?: string;
  }) => void;
}

const UnifiedQuestionnaire: React.FC<UnifiedQuestionnaireProps> = ({
  variant = "page",
  onClose,
  onFiltersApply,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [preferencesApplied, setPreferencesApplied] = useState(false);
  const navigate = useNavigate();

  const { data: products = [] } = useProducts();
  const { data: userPreferences } = useUserPreferences();

  // Pre-fill answers from user preferences (only once)
  useEffect(() => {
    if (userPreferences && !preferencesApplied) {
      const profileFilters = mapProfileToFilters(userPreferences);
      if (profileFilters) {
        const newAnswers: Record<string, string> = {};
        if (profileFilters.gender) newAnswers.gender = profileFilters.gender;
        if (profileFilters.mobility) newAnswers.mobility = profileFilters.mobility;
        if (profileFilters.incontinenceLevel) newAnswers.incontinenceLevel = profileFilters.incontinenceLevel;
        if (profileFilters.usageTime) newAnswers.usageTime = profileFilters.usageTime;
        
        if (Object.keys(newAnswers).length > 0) {
          setAnswers(newAnswers);
        }
      }
      setPreferencesApplied(true);
    }
  }, [userPreferences, preferencesApplied]);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step
        if (variant === "modal" && onFiltersApply) {
          onFiltersApply({
            gender: newAnswers.gender,
            usageTime: newAnswers.usageTime,
            mobility: newAnswers.mobility,
            incontinenceLevel: newAnswers.incontinenceLevel,
          });
        } else {
          setShowResult(true);
        }
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Find recommended products based on answers
  const getRecommendedProducts = (): Product[] => {
    return products.filter((product) => {
      let score = 0;
      
      if (answers.mobility && product.mobility === answers.mobility) score += 2;
      if (answers.incontinenceLevel && product.incontinence_level === answers.incontinenceLevel) score += 2;
      if (answers.usageTime && product.usage_time === answers.usageTime) score += 1;
      
      return score >= 2;
    }).slice(0, 3);
  };

  const selectedAnswer = answers[currentQuestion?.id];
  const recommendedProducts = getRecommendedProducts();
  const primaryProduct = recommendedProducts[0];

  if (showResult && variant === "page") {
    return (
      <section className="section-padding min-h-[80vh]">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Nous avons trouvé ce qu'il vous faut
              </h1>
              <p className="text-muted-foreground">
                Basé sur vos réponses, voici notre recommandation.
              </p>
            </div>

            {/* Recommended Product */}
            {primaryProduct ? (
              <div className="bg-card rounded-2xl p-8 border-2 border-secondary shadow-lg mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full">
                    Recommandé pour vous
                  </span>
                </div>
                {primaryProduct.images?.[0] && (
                  <img 
                    src={primaryProduct.images[0].image_url} 
                    alt={primaryProduct.name}
                    className="w-full h-48 object-contain rounded-xl mb-4"
                  />
                )}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {primaryProduct.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {primaryProduct.short_description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    {primaryProduct.subscription_price ? (
                      <>
                        <span className="text-3xl font-display font-bold text-foreground">
                          {primaryProduct.subscription_price.toFixed(2)}€
                        </span>
                        <span className="text-muted-foreground">/mois en abonnement</span>
                      </>
                    ) : (
                      <span className="text-3xl font-display font-bold text-foreground">
                        {primaryProduct.price.toFixed(2)}€
                      </span>
                    )}
                  </div>
                  <Button asChild size="lg">
                    <Link to={`/produit/${primaryProduct.slug}`} className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Voir le produit
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-8 border-2 border-secondary shadow-lg mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full">
                    Recommandé
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Protection {answers.incontinenceLevel === "light" ? "légère" : answers.incontinenceLevel === "moderate" ? "modérée" : "forte"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Découvrez notre gamme de protections adaptées à vos besoins.
                </p>
                <Button asChild size="lg">
                  <Link to="/boutique" className="gap-2">
                    Voir la boutique
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Subscription Benefits */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground">Économisez avec l'abonnement</h4>
                  <p className="text-sm text-muted-foreground">Flexible, sans engagement</p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-secondary" />
                  <span><strong>10% d'économie</strong> sur chaque commande</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Livraison gratuite dès 49€</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Modifiable ou annulable à tout moment</span>
                </li>
              </ul>
            </div>

            {/* Other recommended products */}
            {recommendedProducts.length > 1 && (
              <div className="bg-muted/50 rounded-xl p-5 mb-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Autres produits adaptés
                </p>
                <div className="space-y-3">
                  {recommendedProducts.slice(1).map((product) => (
                    <Link 
                      key={product.id} 
                      to={`/produit/${product.slug}`}
                      className="flex items-center gap-4 p-3 bg-background rounded-lg hover:shadow-md transition-shadow"
                    >
                      {product.images?.[0] && (
                        <img 
                          src={product.images[0].image_url} 
                          alt={product.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-display font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.price.toFixed(2)}€</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reassurance */}
            <div className="text-center p-5 bg-highlight rounded-xl">
              <p className="text-sm text-foreground font-medium">
                Vous pouvez ajuster à tout moment. Pas d'engagement.
              </p>
            </div>

            <div className="text-center mt-6">
              <Button variant="ghost" asChild>
                <Link to="/boutique">
                  Voir tous les produits
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const content = (
    <>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium">Question {currentStep + 1} sur {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className={`font-display font-bold text-foreground mb-2 ${variant === "modal" ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"}`}>
            {currentQuestion.question}
          </h2>
          <p className="text-muted-foreground mb-6">
            {currentQuestion.subtext}
          </p>

          {/* Options */}
          <div className={`grid gap-3 ${variant === "modal" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            {currentQuestion.options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedAnswer === option.id;

              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-highlight"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    {Icon && (
                      <Icon className={`w-6 h-6 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                    {option.drops !== undefined && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Droplet
                            key={i}
                            className={`w-4 h-4 ${
                              i < option.drops!
                                ? isSelected
                                  ? "fill-primary text-primary"
                                  : "fill-primary/60 text-primary/60"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                    {!Icon && !option.drops && (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/50"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>
        {variant === "modal" && onClose && (
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Passer
          </Button>
        )}
      </div>
    </>
  );

  if (variant === "modal") {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <div className="p-6 md:p-8">{content}</div>
      </Card>
    );
  }

  return <div className="max-w-xl mx-auto">{content}</div>;
};

export default UnifiedQuestionnaire;
