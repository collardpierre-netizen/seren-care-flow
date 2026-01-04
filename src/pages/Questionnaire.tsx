import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, RefreshCw } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Comment se déplace la personne au quotidien ?",
    subtext: "Cela nous aide à choisir le type de protection le plus adapté.",
    options: [
      { id: "mobile", label: "Marche sans aide", description: "Se déplace librement" },
      { id: "semi-mobile", label: "A besoin d'aide", description: "Canne, déambulateur, ou aide d'un proche" },
      { id: "bedridden", label: "Reste principalement au lit", description: "Mobilité très réduite" },
    ],
  },
  {
    id: 2,
    question: "À quelle fréquence y a-t-il des fuites ?",
    subtext: "Il n'y a pas de mauvaise réponse.",
    options: [
      { id: "occasional", label: "Quelques gouttes parfois", description: "Moins d'une fois par jour" },
      { id: "regular", label: "Plusieurs fois par jour", description: "Des fuites régulières" },
      { id: "frequent", label: "Très souvent ou en continu", description: "Protection nécessaire en permanence" },
    ],
  },
  {
    id: 3,
    question: "À quel moment les fuites sont-elles les plus fréquentes ?",
    subtext: "Les besoins peuvent varier entre le jour et la nuit.",
    options: [
      { id: "day", label: "Principalement la journée", description: "Pendant les activités" },
      { id: "night", label: "Principalement la nuit", description: "Pendant le sommeil" },
      { id: "both", label: "Les deux", description: "Jour et nuit" },
    ],
  },
  {
    id: 4,
    question: "Utilise-t-elle déjà des protections ?",
    subtext: "Si oui, cela nous aide à comprendre ce qui fonctionne ou non.",
    options: [
      { id: "none", label: "Non, c'est la première fois", description: "Nous partons de zéro" },
      { id: "pads", label: "Des protections légères", description: "Serviettes ou protège-slips" },
      { id: "pants", label: "Des sous-vêtements absorbants", description: "Culottes ou slips" },
      { id: "all-in-one", label: "Des changes complets", description: "Protection intégrale" },
    ],
  },
  {
    id: 5,
    question: "Qu'est-ce qui compte le plus ?",
    subtext: "Il n'y a pas de mauvaise priorité.",
    options: [
      { id: "comfort", label: "Le confort", description: "Douceur et bien-être" },
      { id: "discretion", label: "La discrétion", description: "Que ça ne se voit pas" },
      { id: "safety", label: "La sécurité", description: "Éviter les fuites" },
    ],
  },
];

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedAnswer = answers[currentQuestion?.id];

  if (showResult) {
    return (
      <>
        <Helmet>
          <title>Votre recommandation - SerenCare</title>
        </Helmet>
        <Layout>
          <section className="section-padding min-h-[80vh] flex items-center">
            <div className="container-main">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
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
                <div className="bg-card rounded-2xl p-8 border-2 border-secondary shadow-lg mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full">
                      Recommandé
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Pack Protection Modérée
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sous-vêtements absorbants jour & nuit. Confort optimal, absorption renforcée.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-display font-bold text-foreground">34,90€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <Button asChild size="lg">
                      <Link to="/boutique" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        S'abonner
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Alternative */}
                <div className="bg-muted/50 rounded-xl p-5 mb-8">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Alternative</p>
                  <p className="font-display font-semibold text-foreground">
                    Pack Protection Forte
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Si les fuites sont plus importantes que prévu.
                  </p>
                </div>

                {/* Reassurance */}
                <div className="text-center p-5 bg-highlight rounded-xl">
                  <p className="text-sm text-foreground font-medium">
                    Vous pouvez ajuster à tout moment. Pas d'engagement.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Questionnaire - Trouvez la bonne protection | SerenCare</title>
      </Helmet>
      <Layout>
        <section className="section-padding min-h-[80vh] flex items-center">
          <div className="container-main">
            <div className="max-w-xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-10">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span className="font-medium">Question {currentStep + 1}/{questions.length}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {currentQuestion.question}
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    {currentQuestion.subtext}
                  </p>

                  {/* Options */}
                  <div className="space-y-3 mb-10">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                          selectedAnswer === option.id
                            ? "border-primary bg-highlight"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              selectedAnswer === option.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/50"
                            }`}
                          >
                            {selectedAnswer === option.id && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className="gap-2"
                >
                  {currentStep === questions.length - 1 ? "Voir ma recommandation" : "Suivant"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Questionnaire;
