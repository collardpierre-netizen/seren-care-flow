// SerenCare Size Guide Modal
import { useState } from "react";
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
import { Ruler, HelpCircle, CheckCircle2, AlertCircle, Lightbulb, Mail } from "lucide-react";

// Centralized size data
const SIZE_RANGES = [
  { size: "S", min: 55, max: 80 },
  { size: "M", min: 70, max: 110 },
  { size: "L", min: 100, max: 150 },
  { size: "XL", min: 130, max: 175 },
] as const;

const SUPPORT_EMAIL = "info@serencare.be";

type SizeType = "S" | "M" | "L" | "XL";

interface SizeRecommendation {
  primary: SizeType;
  alternative?: SizeType;
  isBetweenSizes: boolean;
}

function getSizeRecommendation(waist: number): SizeRecommendation | null {
  if (waist < 55 || waist > 175) return null;

  const matchingSizes = SIZE_RANGES.filter(
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

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: string;
  productType?: "pants" | "slip" | "change-complet" | "protection";
}

export function SizeGuideModal({
  open,
  onOpenChange,
  brand,
  productType,
}: SizeGuideModalProps) {
  const [waistInput, setWaistInput] = useState("");
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSuggestSize = () => {
    const waist = parseInt(waistInput, 10);
    if (!isNaN(waist)) {
      const result = getSizeRecommendation(waist);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[640px] max-h-[90vh] overflow-y-auto"
        aria-labelledby="size-guide-title"
        aria-describedby="size-guide-description"
      >
        <DialogHeader>
          <DialogTitle id="size-guide-title" className="text-2xl font-display flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            Comment choisir la bonne taille ?
          </DialogTitle>
          <DialogDescription id="size-guide-description" className="text-base">
            Un bon ajustement garantit confort, sécurité et efficacité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Étape 1 - Comment mesurer */}
          <section className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
              Comment mesurer ?
            </h3>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm">
                <strong>Mesurez le tour de taille</strong> (au niveau du nombril), sans serrer.
              </p>
              <p className="text-sm text-primary font-medium">
                Si la personne est entre deux tailles, choisissez la taille supérieure pour plus de confort.
              </p>
            </div>
          </section>

          {/* Aide au choix - Input */}
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
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
                  min={55}
                  max={175}
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
            {hasSearched && (
              <div className={`rounded-lg p-3 ${recommendation ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                {recommendation ? (
                  <div className="space-y-1">
                    <p className="font-semibold flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      Taille recommandée : {recommendation.primary}
                    </p>
                    {recommendation.isBetweenSizes && (
                      <p className="text-sm text-green-700">
                        Entre deux tailles ? Préférez la taille au-dessus ({recommendation.primary}) pour plus de confort.
                        {recommendation.alternative && ` La taille ${recommendation.alternative} peut aussi convenir.`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Ce tour de taille est hors des plages standard (55-175 cm). Contactez-nous pour un conseil personnalisé.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Tableau des tailles */}
          <section className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
              Tableau des tailles
            </h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Taille</th>
                    <th className="text-left py-3 px-4 font-semibold">Tour de taille</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_RANGES.map((range, idx) => (
                    <tr
                      key={range.size}
                      className={`border-t ${recommendation?.primary === range.size ? "bg-primary/10 font-semibold" : ""}`}
                    >
                      <td className="py-3 px-4">{range.size}</td>
                      <td className="py-3 px-4">{range.min} – {range.max} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Les tailles peuvent légèrement varier selon les marques et les modèles.
            </p>
          </section>

          {/* Étape 3 - Vérification */}
          <section className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
              Vérifiez le bon ajustement
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                Le produit doit être bien plaqué, sans plis.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                Les attaches doivent être symétriques.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                Aucun point de compression (aine / ventre).
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                Pas de fuites après quelques heures d'utilisation.
              </li>
            </ul>
          </section>

          {/* Bon à savoir */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5" />
              Bon à savoir
            </h3>
            <ul className="text-sm space-y-1 text-amber-800">
              <li>• <strong>Taille trop petite</strong> = fuites et inconfort.</li>
              <li>• <strong>Taille trop grande</strong> = manque de maintien.</li>
              <li>• Le niveau d'absorption n'influence pas la taille.</li>
            </ul>
          </section>

          {/* Astuce SerenCare */}
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2 text-primary mb-2">
              <Lightbulb className="w-5 h-5" />
              Astuce SerenCare
            </h3>
            <p className="text-sm text-muted-foreground">
              En cas de doute, commencez par un paquet test ou contactez notre équipe : nous vous aidons à choisir en quelques minutes.
            </p>
          </section>

          {/* CTA */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Fermer
            </Button>
            <Button asChild className="flex-1 gap-2">
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Aide%20au%20choix%20de%20taille`}>
                <HelpCircle className="w-4 h-4" />
                Besoin d'aide pour choisir ?
              </a>
            </Button>
          </div>
        </div>
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
      className={`text-sm text-primary hover:text-primary/80 hover:underline underline-offset-2 flex items-center gap-1.5 transition-colors ${className || ""}`}
    >
      <Ruler className="w-4 h-4" />
      Guide des tailles
    </button>
  );
}
