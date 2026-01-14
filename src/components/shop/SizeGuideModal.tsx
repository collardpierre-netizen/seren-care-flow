// SerenCare Size Guide Modal
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, HelpCircle, CheckCircle2, AlertCircle, Lightbulb, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeasurementIllustration } from "./MeasurementIllustration";
import { usePreferredSize } from "@/hooks/usePreferredSize";
import { extractStandardSize, findMatchingProductSize } from "@/lib/sizeUtils";

// Centralized size data by brand
const SIZE_DATA = {
  standard: {
    label: "Standard",
    ranges: [
      { size: "S", min: 55, max: 80 },
      { size: "M", min: 70, max: 110 },
      { size: "L", min: 100, max: 150 },
      { size: "XL", min: 130, max: 175 },
    ],
  },
  tena: {
    label: "TENA",
    ranges: [
      { size: "S", min: 55, max: 75 },
      { size: "M", min: 70, max: 110 },
      { size: "L", min: 100, max: 145 },
      { size: "XL", min: 130, max: 170 },
    ],
  },
  hartmann: {
    label: "Hartmann",
    ranges: [
      { size: "S", min: 60, max: 85 },
      { size: "M", min: 75, max: 115 },
      { size: "L", min: 100, max: 150 },
      { size: "XL", min: 135, max: 175 },
    ],
  },
  lille: {
    label: "Lille Healthcare",
    ranges: [
      { size: "S", min: 50, max: 80 },
      { size: "M", min: 70, max: 105 },
      { size: "L", min: 95, max: 145 },
      { size: "XL", min: 125, max: 170 },
    ],
  },
} as const;

type BrandKey = keyof typeof SIZE_DATA;
type SizeType = "S" | "M" | "L" | "XL";

const SUPPORT_EMAIL = "info@serencare.be";

interface SizeRecommendation {
  primary: SizeType;
  alternative?: SizeType;
  isBetweenSizes: boolean;
}

function getSizeRecommendation(waist: number, brand: BrandKey = "standard"): SizeRecommendation | null {
  const ranges = SIZE_DATA[brand].ranges;
  const minRange = ranges[0].min;
  const maxRange = ranges[ranges.length - 1].max;
  
  if (waist < minRange || waist > maxRange) return null;

  const matchingSizes = ranges.filter(
    (range) => waist >= range.min && waist <= range.max
  );

  if (matchingSizes.length === 0) return null;

  if (matchingSizes.length === 1) {
    return {
      primary: matchingSizes[0].size,
      isBetweenSizes: false,
    };
  }

  // Multiple matches = between sizes, recommend larger
  return {
    primary: matchingSizes[matchingSizes.length - 1].size,
    alternative: matchingSizes[0].size,
    isBetweenSizes: true,
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, type: "spring" as const, stiffness: 300, damping: 24 },
  }),
};

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: string;
  productType?: "pants" | "slip" | "change-complet" | "protection";
  availableSizes?: string[];
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

export function SizeGuideModal({
  open,
  onOpenChange,
  brand,
  productType,
  availableSizes,
  selectedSize,
  onSelectSize,
}: SizeGuideModalProps) {
  const [waistInput, setWaistInput] = useState("");
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { preferredSize, savePreferredSize, isSaving } = usePreferredSize();
  
  // Determine active brand tab
  const detectBrand = (): BrandKey => {
    if (!brand) return "standard";
    const lowerBrand = brand.toLowerCase();
    if (lowerBrand.includes("tena")) return "tena";
    if (lowerBrand.includes("hartmann") || lowerBrand.includes("molicare")) return "hartmann";
    if (lowerBrand.includes("lille")) return "lille";
    return "standard";
  };
  
  const [activeBrand, setActiveBrand] = useState<BrandKey>(detectBrand());

  const handleSuggestSize = () => {
    const waist = parseInt(waistInput, 10);
    if (!isNaN(waist)) {
      const result = getSizeRecommendation(waist, activeBrand);
      setRecommendation(result);
      setHasSearched(true);
    }
  };

  const handleClose = () => {
    setWaistInput("");
    setRecommendation(null);
    setHasSearched(false);
    onOpenChange(false);
  };

  const handleSizeSelect = (standardSize: string, saveAsPreferred = false) => {
    if (saveAsPreferred) {
      savePreferredSize(standardSize);
    }
    if (onSelectSize && availableSizes) {
      // Find the actual product size that matches this standard size
      const matchingProductSize = findMatchingProductSize(availableSizes, standardSize);
      if (matchingProductSize) {
        onSelectSize(matchingProductSize);
        handleClose();
      }
    }
  };
  
  // Check if a standard size is available in the product sizes
  const isStandardSizeAvailable = (standardSize: string): boolean => {
    if (!availableSizes) return false;
    return !!findMatchingProductSize(availableSizes, standardSize);
  };

  const currentRanges = SIZE_DATA[activeBrand].ranges;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[680px] max-h-[90vh] overflow-y-auto p-0"
        aria-labelledby="size-guide-title"
        aria-describedby="size-guide-description"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6"
        >
          <DialogHeader>
            <motion.div variants={itemVariants}>
              <DialogTitle id="size-guide-title" className="text-2xl font-display flex items-center gap-2">
                <Ruler className="w-6 h-6 text-primary" />
                Comment choisir la bonne taille ?
              </DialogTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <DialogDescription id="size-guide-description" className="text-base">
                Un bon ajustement garantit confort, sécurité et efficacité.
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Étape 1 - Comment mesurer avec illustration */}
            <motion.section variants={itemVariants} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Comment mesurer ?
              </h3>
              <div className="bg-muted/50 rounded-xl p-4 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Mesurez le tour de taille</strong> (au niveau du nombril), sans serrer.
                  </p>
                  <p className="text-sm text-primary font-medium">
                    Si la personne est entre deux tailles, choisissez la taille supérieure pour plus de confort.
                  </p>
                  {preferredSize && (
                    <div className="mt-3 p-2 bg-secondary/10 rounded-lg border border-secondary/20">
                      <p className="text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4 text-secondary fill-secondary" />
                        Votre taille préférée : <strong>{preferredSize}</strong>
                      </p>
                    </div>
                  )}
                </div>
                <MeasurementIllustration className="max-w-[180px] mx-auto" />
              </div>
            </motion.section>

            {/* Aide au choix - Input */}
            <motion.section 
              variants={itemVariants}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Aide au choix rapide
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="waist-input" className="text-sm text-muted-foreground">
                    Tour de taille (cm)
                  </Label>
                  <Input
                    id="waist-input"
                    type="number"
                    placeholder="Ex: 95"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSuggestSize()}
                    className="mt-1"
                    min={50}
                    max={180}
                  />
                </div>
                <Button
                  onClick={handleSuggestSize}
                  className="self-end"
                  disabled={!waistInput}
                >
                  Suggérer une taille
                </Button>
              </div>

              {/* Recommendation result */}
              <AnimatePresence mode="wait">
                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "rounded-lg p-4 overflow-hidden",
                      recommendation 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-amber-50 border border-amber-200"
                    )}
                  >
                    {recommendation ? (
                      <div className="space-y-3">
                        <p className="font-semibold flex items-center gap-2 text-green-800">
                          <CheckCircle2 className="w-5 h-5" />
                          Taille recommandée : <span className="text-xl">{recommendation.primary}</span>
                        </p>
                        {recommendation.isBetweenSizes && (
                          <p className="text-sm text-green-700">
                            Entre deux tailles ? Préférez la taille au-dessus ({recommendation.primary}) pour plus de confort.
                            {recommendation.alternative && ` La taille ${recommendation.alternative} peut aussi convenir.`}
                          </p>
                        )}
                        
                        {/* Quick select buttons */}
                        {onSelectSize && isStandardSizeAvailable(recommendation.primary) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-2 mt-2"
                          >
                            <Button
                              onClick={() => handleSizeSelect(recommendation.primary, false)}
                              className="flex-1 gap-2"
                              variant="default"
                            >
                              <Check className="w-4 h-4" />
                              Sélectionner {recommendation.primary}
                            </Button>
                            <Button
                              onClick={() => handleSizeSelect(recommendation.primary, true)}
                              className="flex-1 gap-2"
                              variant="secondary"
                              disabled={isSaving}
                            >
                              <Heart className="w-4 h-4" />
                              Sélectionner et mémoriser
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <p className="text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Ce tour de taille est hors des plages standard. Contactez-nous pour un conseil personnalisé.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Tableau des tailles par marque */}
            <motion.section variants={itemVariants} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Tableau des tailles
              </h3>
              
              <Tabs value={activeBrand} onValueChange={(v) => setActiveBrand(v as BrandKey)} className="w-full">
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="standard" className="text-xs sm:text-sm">Standard</TabsTrigger>
                  <TabsTrigger value="tena" className="text-xs sm:text-sm">TENA</TabsTrigger>
                  <TabsTrigger value="hartmann" className="text-xs sm:text-sm">Hartmann</TabsTrigger>
                  <TabsTrigger value="lille" className="text-xs sm:text-sm">Lille</TabsTrigger>
                </TabsList>
                
                {Object.entries(SIZE_DATA).map(([key, data]) => (
                  <TabsContent key={key} value={key} className="mt-0">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                      className="border rounded-xl overflow-hidden"
                    >
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold">Taille</th>
                            <th className="text-left py-3 px-4 font-semibold">Tour de taille</th>
                            {onSelectSize && availableSizes && (
                              <th className="text-right py-3 px-4 font-semibold">Action</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {data.ranges.map((range, idx) => {
                            const isRecommended = recommendation?.primary === range.size;
                            // Use the smart matching function instead of direct includes
                            const isAvailable = isStandardSizeAvailable(range.size);
                            // Check if selected size matches this standard size
                            const isSelected = selectedSize ? extractStandardSize(selectedSize) === range.size : false;
                            
                            return (
                              <motion.tr
                                key={range.size}
                                custom={idx}
                                variants={tableRowVariants}
                                className={cn(
                                  "border-t transition-colors",
                                  isRecommended && "bg-primary/10",
                                  isSelected && "bg-secondary/10"
                                )}
                              >
                                <td className="py-3 px-4">
                                  <span className={cn(
                                    "font-medium",
                                    isRecommended && "text-primary font-bold"
                                  )}>
                                    {range.size}
                                  </span>
                                  {isRecommended && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-2 inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Recommandé
                                    </motion.span>
                                  )}
                                </td>
                                <td className="py-3 px-4">{range.min} – {range.max} cm</td>
                                {onSelectSize && availableSizes && (
                                  <td className="py-3 px-4 text-right">
                                    {isAvailable ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          size="sm"
                                          variant={isSelected ? "secondary" : "outline"}
                                          onClick={() => handleSizeSelect(range.size, false)}
                                          className="gap-1"
                                        >
                                          {isSelected ? (
                                            <>
                                              <Check className="w-3 h-3" />
                                              Sélectionné
                                            </>
                                          ) : (
                                            "Choisir"
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleSizeSelect(range.size, true)}
                                          className="p-2"
                                          title="Mémoriser cette taille"
                                        >
                                          <Heart className={cn(
                                            "w-4 h-4",
                                            preferredSize === range.size && "fill-secondary text-secondary"
                                          )} />
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Non dispo.</span>
                                    )}
                                  </td>
                                )}
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
              
              <p className="text-xs text-muted-foreground italic">
                Les tailles peuvent légèrement varier selon les marques et les modèles.
              </p>
            </motion.section>

            {/* Étape 3 - Vérification */}
            <motion.section variants={itemVariants} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                Vérifiez le bon ajustement
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Le produit doit être bien plaqué, sans plis.",
                  "Les attaches doivent être symétriques.",
                  "Aucun point de compression (aine / ventre).",
                  "Pas de fuites après quelques heures d'utilisation."
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            {/* Bon à savoir */}
            <motion.section 
              variants={itemVariants}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2"
            >
              <h3 className="font-semibold flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Bon à savoir
              </h3>
              <ul className="text-sm space-y-1 text-amber-800">
                <li>• <strong>Taille trop petite</strong> = fuites et inconfort.</li>
                <li>• <strong>Taille trop grande</strong> = manque de maintien.</li>
                <li>• Le niveau d'absorption n'influence pas la taille.</li>
              </ul>
            </motion.section>

            {/* Astuce SerenCare */}
            <motion.section 
              variants={itemVariants}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
            >
              <h3 className="font-semibold flex items-center gap-2 text-primary mb-2">
                <Lightbulb className="w-5 h-5" />
                Astuce SerenCare
              </h3>
              <p className="text-sm text-muted-foreground">
                En cas de doute, commencez par un paquet test ou contactez notre équipe : nous vous aidons à choisir en quelques minutes.
              </p>
            </motion.section>

            {/* CTA */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t"
            >
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fermer
              </Button>
              <Button asChild className="flex-1 gap-2">
                <a href={`mailto:${SUPPORT_EMAIL}?subject=Aide%20au%20choix%20de%20taille`}>
                  <HelpCircle className="w-4 h-4" />
                  Besoin d'aide pour choisir ?
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Reusable trigger button
interface SizeGuideButtonProps {
  onClick: () => void;
  className?: string;
}

export function SizeGuideButton({ onClick, className }: SizeGuideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm text-primary hover:text-primary/80 hover:underline underline-offset-2 flex items-center gap-1.5 transition-colors",
        className
      )}
    >
      <Ruler className="w-4 h-4" />
      Guide des tailles
    </button>
  );
}
