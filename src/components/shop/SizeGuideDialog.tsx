import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler, HelpCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface SizeGuideDialogProps {
  trigger?: React.ReactNode;
}

export function SizeGuideDialog({ trigger }: SizeGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            <Ruler className="w-4 h-4" />
            Quelle taille choisir ?
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            Choisir la bonne taille
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <p className="text-muted-foreground">
            Choisir la bonne taille est essentiel pour le confort, la discrétion et l'efficacité de la protection.
            En quelques secondes, vous pouvez vérifier que vous faites le bon choix.
          </p>

          {/* Étape 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-xl">🧵</span> Étape 1 — Comment mesurer ?
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium">Munissez-vous d'un mètre souple.</p>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Mesurez le tour de taille</strong> (au niveau du nombril, sans serrer)</li>
                <li>• <strong>Mesurez le tour de hanches</strong> (au point le plus large)</li>
              </ul>
              <p className="text-primary font-medium mt-3">
                👉 Retenez toujours la mesure la plus grande.
              </p>
              <p className="text-xs text-muted-foreground italic">
                (C'est la règle utilisée par les fabricants.)
              </p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-xl">📏</span> Étape 2 — Trouvez votre taille
            </h3>

            {/* Hartmann */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 font-semibold text-primary">
                🟦 Hartmann – MoliCare® Pants
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Taille</th>
                      <th className="text-left py-2 font-medium">Tour de taille</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">M</td>
                      <td className="py-2">70 – 120 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2">L</td>
                      <td className="py-2">100 – 150 cm</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  Contenu : Taille M : 8 protections • Taille L : 7 protections
                </p>
              </div>
            </div>

            {/* TENA */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 font-semibold text-primary">
                🟦 TENA – ProSkin Pants
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Taille</th>
                      <th className="text-left py-2 font-medium">Tour de taille</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">S</td>
                      <td className="py-2">56 – 85 cm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">M</td>
                      <td className="py-2">80 – 110 cm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">L</td>
                      <td className="py-2">100 – 135 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2">XL</td>
                      <td className="py-2">120 – 160 cm</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  Contenu : S / M / L : 14 protections • XL : 12 protections
                </p>
              </div>
            </div>

            {/* Lille */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 font-semibold text-primary">
                🟦 Lille – Suprem Pants
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Taille</th>
                      <th className="text-left py-2 font-medium">Tour de taille</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">S</td>
                      <td className="py-2">60 – 90 cm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">M</td>
                      <td className="py-2">80 – 120 cm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">L</td>
                      <td className="py-2">100 – 150 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2">XL</td>
                      <td className="py-2">120 – 170 cm</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  Contenu : S / M / L : 14 protections • XL : 12 protections
                </p>
              </div>
            </div>
          </div>

          {/* Entre deux tailles */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🤔</span> Entre deux tailles ?
            </h3>
            <ul className="text-sm space-y-1">
              <li>• Si vous êtes entre deux tailles, <strong>choisissez la plus petite</strong> 👉 meilleure tenue, plus discrète</li>
              <li>• Si la protection semble trop serrée ou inconfortable, passez à la taille au-dessus</li>
            </ul>
          </div>

          {/* Bon à savoir */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💡</span> Bon à savoir
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Une taille trop grande peut provoquer des fuites</li>
              <li>• Une taille bien ajustée améliore le confort et la sécurité</li>
              <li>• Vous pouvez modifier la taille à tout moment, surtout en abonnement</li>
            </ul>
          </div>

          {/* Besoin d'aide */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center space-y-3">
            <h3 className="font-semibold flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Besoin d'aide ?
            </h3>
            <p className="text-sm text-muted-foreground">
              Vous hésitez encore ?<br />
              👉 Un humain peut vous aider à choisir, simplement.
            </p>
            <Button asChild>
              <Link to="/contact" className="gap-2">
                <Phone className="w-4 h-4" />
                Être conseillé
              </Link>
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center italic pt-2 border-t">
            Les tailles peuvent varier légèrement selon les marques. SerenCare vous accompagne pour faire le bon choix.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
