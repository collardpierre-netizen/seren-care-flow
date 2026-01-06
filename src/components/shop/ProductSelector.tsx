import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, User, Users, Sun, Moon, Footprints, Armchair, BedDouble, Droplet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProductSelectorProps {
  onFiltersApply: (filters: {
    gender?: string;
    usageTime?: string;
    mobility?: string;
    incontinenceLevel?: string;
  }) => void;
  onClose: () => void;
}

const steps = [
  {
    id: 'gender',
    title: 'Pour qui recherchez-vous ?',
    subtitle: 'Certains produits sont adaptés à l\'anatomie masculine ou féminine.',
    options: [
      { id: 'male', label: 'Un homme', icon: User },
      { id: 'female', label: 'Une femme', icon: User },
      { id: 'any', label: 'Peu importe', icon: Users },
    ]
  },
  {
    id: 'usageTime',
    title: 'Moment d\'utilisation ?',
    subtitle: 'Le jour, la nuit ou les deux ?',
    options: [
      { id: 'day', label: 'Jour uniquement', icon: Sun },
      { id: 'night', label: 'Nuit uniquement', icon: Moon },
      { id: 'day_night', label: 'Jour et nuit', icon: Sun },
    ]
  },
  {
    id: 'mobility',
    title: 'Niveau de mobilité ?',
    subtitle: 'La mobilité influence le type de produit recommandé.',
    options: [
      { id: 'mobile', label: 'Mobile / Actif', description: 'Se déplace seul(e)', icon: Footprints },
      { id: 'reduced', label: 'Mobilité réduite', description: 'Besoin d\'aide pour se déplacer', icon: Armchair },
      { id: 'bedridden', label: 'Alité(e)', description: 'Reste au lit', icon: BedDouble },
    ]
  },
  {
    id: 'incontinenceLevel',
    title: 'Niveau d\'incontinence ?',
    subtitle: 'Évaluez la quantité de fuites à gérer.',
    options: [
      { id: 'light', label: 'Légère', description: 'Quelques gouttes', drops: 1 },
      { id: 'moderate', label: 'Modérée', description: 'Fuites régulières', drops: 2 },
      { id: 'heavy', label: 'Forte', description: 'Fuites importantes', drops: 3 },
      { id: 'very_heavy', label: 'Très forte', description: 'Incontinence complète', drops: 4 },
    ]
  }
];

const ProductSelector: React.FC<ProductSelectorProps> = ({ onFiltersApply, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (stepId: string, optionId: string) => {
    const newSelections = { ...selections, [stepId]: optionId };
    setSelections(newSelections);
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      // Last step - apply filters
      onFiltersApply({
        gender: newSelections.gender,
        usageTime: newSelections.usageTime,
        mobility: newSelections.mobility,
        incontinenceLevel: newSelections.incontinenceLevel,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="p-6 md:p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Étape {currentStep + 1} sur {steps.length}</span>
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
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {step.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {step.options.map((option) => {
                const Icon = 'icon' in option ? option.icon : null;
                const isSelected = selections[step.id] === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(step.id, option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />}
                      {'drops' in option && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Droplet
                              key={i}
                              className={`w-4 h-4 ${
                                i < (option.drops || 0)
                                  ? isSelected ? 'fill-primary text-primary' : 'fill-primary/60 text-primary/60'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </p>
                        {'description' in option && option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
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
            className="text-muted-foreground"
          >
            Retour
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Passer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductSelector;
