import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  User, 
  Heart, 
  Users, 
  Stethoscope, 
  HelpCircle,
  Sun,
  Moon,
  Clock,
  Footprints,
  Armchair,
  BedDouble,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
  }[];
}

const steps: OnboardingStep[] = [
  {
    id: 'buying_for',
    title: 'Pour qui achetez-vous ?',
    subtitle: 'Cela nous aide à personnaliser votre expérience',
    options: [
      { id: 'self', label: 'Pour moi-même', icon: <User className="h-6 w-6" /> },
      { id: 'parent', label: 'Pour un parent', icon: <Heart className="h-6 w-6" /> },
      { id: 'spouse', label: 'Pour mon conjoint', icon: <Users className="h-6 w-6" /> },
      { id: 'patient', label: 'Pour un patient', description: 'Professionnel de santé', icon: <Stethoscope className="h-6 w-6" /> },
      { id: 'other', label: 'Autre', icon: <HelpCircle className="h-6 w-6" /> },
    ]
  },
  {
    id: 'age_range',
    title: 'Quelle est la tranche d\'âge ?',
    subtitle: 'Les besoins varient selon l\'âge',
    options: [
      { id: '18-40', label: '18 - 40 ans', icon: <User className="h-6 w-6" /> },
      { id: '40-60', label: '40 - 60 ans', icon: <User className="h-6 w-6" /> },
      { id: '60-75', label: '60 - 75 ans', icon: <User className="h-6 w-6" /> },
      { id: '75+', label: '75 ans et plus', icon: <User className="h-6 w-6" /> },
    ]
  },
  {
    id: 'incontinence_level',
    title: 'Quel niveau de protection ?',
    subtitle: 'Pour vous recommander les bons produits',
    options: [
      { id: 'light', label: 'Légère', description: 'Quelques gouttes', icon: <Droplets className="h-6 w-6" /> },
      { id: 'moderate', label: 'Modérée', description: 'Fuites régulières', icon: <Droplets className="h-6 w-6" /> },
      { id: 'heavy', label: 'Forte', description: 'Fuites importantes', icon: <Droplets className="h-6 w-6" /> },
      { id: 'very_heavy', label: 'Très forte', description: 'Protection maximale', icon: <Droplets className="h-6 w-6" /> },
    ]
  },
  {
    id: 'mobility_level',
    title: 'Quelle est la mobilité ?',
    subtitle: 'Pour adapter le type de produit',
    options: [
      { id: 'mobile', label: 'Mobile', description: 'Actif et autonome', icon: <Footprints className="h-6 w-6" /> },
      { id: 'reduced', label: 'Mobilité réduite', description: 'Aide partielle nécessaire', icon: <Armchair className="h-6 w-6" /> },
      { id: 'bedridden', label: 'Alité', description: 'Assistance complète', icon: <BedDouble className="h-6 w-6" /> },
    ]
  },
  {
    id: 'usage_time',
    title: 'Quand utiliser la protection ?',
    subtitle: 'Jour, nuit ou les deux',
    options: [
      { id: 'day', label: 'Jour uniquement', icon: <Sun className="h-6 w-6" /> },
      { id: 'night', label: 'Nuit uniquement', icon: <Moon className="h-6 w-6" /> },
      { id: 'day_night', label: 'Jour et nuit', icon: <Clock className="h-6 w-6" /> },
    ]
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newsletter, setNewsletter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/connexion');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Check if onboarding is already completed
    const checkOnboarding = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      
      if (data?.onboarding_completed) {
        navigate('/');
      }
    };
    
    checkOnboarding();
  }, [user, navigate]);

  const handleAnswer = (stepId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: answerId }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          buying_for: answers.buying_for,
          age_range: answers.age_range,
          incontinence_level: answers.incontinence_level,
          mobility_level: answers.mobility_level,
          usage_time: answers.usage_time,
          newsletter_subscribed: newsletter,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil complété !', {
        description: 'Nous avons personnalisé votre expérience.',
      });
      navigate('/boutique');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      navigate('/');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = answers[step.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <img 
          src="/logo-192.png" 
          alt="SerenCare" 
          className="h-10 w-auto"
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Passer
        </Button>
      </div>

      {/* Progress */}
      <div className="px-6 pt-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Étape {currentStep + 1} sur {steps.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
                  {step.title}
                </h1>
                <p className="text-muted-foreground">
                  {step.subtitle}
                </p>
              </div>

              <div className="grid gap-3">
                {step.options.map((option) => {
                  const isSelected = answers[step.id] === option.id;
                  
                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => handleAnswer(step.id, option.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {option.label}
                            </p>
                            {option.description && (
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Newsletter option on last step */}
              {isLastStep && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-4 bg-muted/50 rounded-xl border border-border"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="newsletter" 
                      checked={newsletter}
                      onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                    />
                    <label htmlFor="newsletter" className="cursor-pointer">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Recevoir nos conseils et offres
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Astuces bien-être, nouveautés et promotions exclusives
                      </p>
                    </label>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-between items-center gap-4 max-w-lg mx-auto w-full">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        
        {isLastStep ? (
          <Button
            onClick={handleComplete}
            disabled={!canProceed || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Terminer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
