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
      { id: "mobile", label: "Elle marche sans aide", description: "Se déplace librement" },
      { id: "semi-mobile", label: "Elle a besoin d'aide pour marcher", description: "Canne, déambulateur, ou aide d'un proche" },
      { id: "bedridden", label: "Elle reste principalement au lit", description: "Mobilité très réduite" },
    ],
  },
  {
    id: 2,
    question: "À quelle fréquence y a-t-il des fuites ?",
    subtext: "Il n'y a pas de mauvaise réponse. Cela nous aide à trouver la bonne absorption.",
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
      { id: "both", label: "Les deux, jour et nuit", description: "Protection continue" },
    ],
  },
  {
    id: 4,
    question: "Utilise-t-elle déjà des protections ?",
    subtext: "Si oui, cela nous aide à comprendre ce qui fonctionne ou non.",
    options: [
      { id: "none", label: "Non, c'est la première fois", description: "Nous partons de zéro" },
      { id: "pads", label: "Des protections légères (serviettes)", description: "Mais ce n'est pas suffisant" },
      { id: "pants", label: "Des sous-vêtements absorbants", description: "Culottes ou slips" },
      { id: "all-in-one", label: "Des changes complets", description: "Protection intégrale" },
    ],
  },
  {
    id: 5,
    question: "Qu'est-ce qui compte le plus pour vous ?",
    subtext: "Il n'y a pas de mauvaise priorité.",
    options: [
      { id: "comfort", label: "Le confort au quotidien", description: "Douceur et bien-être" },
      { id: "discretion", label: "La discrétion", description: "Que ça ne se voit pas" },
      { id: "safety", label: "La sécurité avant tout", description: "Éviter les fuites à tout prix" },
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
          <section className="section-padding bg-gradient-to-br from-background via-accent/30 to-background min-h-[80vh] flex items-center">
            <div className="container-main">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-12">
                  <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-secondary" />
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Nous avons trouvé ce qu'il vous faut
                  </h1>
                  <p className="text-muted-foreground">
                    Basé sur vos réponses, voici notre recommandation.
                  </p>
                </div>

                {/* Recommended Product */}
                <div className="bg-card rounded-3xl p-8 shadow-card border border-secondary mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                      Recommandé pour vous
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
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
                        Recevoir chaque mois
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Alternative */}
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Alternative possible</p>
                  <h4 className="font-display font-semibold text-foreground mb-2">
                    Pack Protection Forte
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Si les fuites sont plus importantes que prévu.
                  </p>
                </div>

                {/* Reassurance */}
                <div className="text-center bg-accent/50 rounded-2xl p-6">
                  <p className="text-foreground font-medium mb-2">
                    Vous pouvez ajuster à tout moment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pas d'engagement. Si ça ne convient pas, changez ou arrêtez quand vous voulez.
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
            <div className="max-w-2xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentStep + 1} sur {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {currentQuestion.question}
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    {currentQuestion.subtext}
                  </p>

                  {/* Options */}
                  <div className="space-y-4 mb-8">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                          selectedAnswer === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswer === option.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedAnswer === option.id && (
                              <Check className="w-4 h-4 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{option.label}</div>
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
