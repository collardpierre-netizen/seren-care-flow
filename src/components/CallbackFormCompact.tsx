import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallbackFormCompactProps {
  variant?: "default" | "light";
}

const CallbackFormCompact = ({ variant = "default" }: CallbackFormCompactProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    preferredDay: "",
    preferredTime: "",
  });

  const isLight = variant === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await (supabase.from("callback_requests" as any) as any).insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        preferred_day: formData.preferredDay || null,
        preferred_time: formData.preferredTime || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Demande envoyée ! Nous vous rappellerons bientôt.");
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
          isLight ? "bg-primary-foreground/20" : "bg-primary/10"
        }`}>
          <Check className={`w-6 h-6 ${isLight ? "text-primary-foreground" : "text-primary"}`} />
        </div>
        <h3 className={`font-display text-lg font-semibold mb-1 ${
          isLight ? "text-primary-foreground" : "text-foreground"
        }`}>
          Demande envoyée !
        </h3>
        <p className={isLight ? "text-primary-foreground/80 text-sm" : "text-muted-foreground text-sm"}>
          Nous vous rappellerons bientôt.
        </p>
      </div>
    );
  }

  const inputClass = isLight 
    ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-9" 
    : "h-9";

  const labelClass = isLight ? "text-primary-foreground/90 text-xs" : "text-xs";

  const handleNext = () => {
    if (formData.firstName && formData.lastName && formData.phone) {
      setStep(2);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {step === 1 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName-compact" className={labelClass}>
                Prénom *
              </Label>
              <Input
                id="firstName-compact"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Prénom"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName-compact" className={labelClass}>
                Nom *
              </Label>
              <Input
                id="lastName-compact"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nom"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone-compact" className={labelClass}>
              Téléphone *
            </Label>
            <Input
              id="phone-compact"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
              className={inputClass}
            />
          </div>

          <Button 
            type="button"
            size="lg" 
            variant={isLight ? "white" : "default"}
            className="w-full" 
            onClick={handleNext}
            disabled={!formData.firstName || !formData.lastName || !formData.phone}
          >
            Suivant
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <Label htmlFor="preferredDay-compact" className={labelClass}>
              Jour de préférence
            </Label>
            <Select
              value={formData.preferredDay}
              onValueChange={(value) => setFormData({ ...formData, preferredDay: value })}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Choisir un jour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lundi">Lundi</SelectItem>
                <SelectItem value="mardi">Mardi</SelectItem>
                <SelectItem value="mercredi">Mercredi</SelectItem>
                <SelectItem value="jeudi">Jeudi</SelectItem>
                <SelectItem value="vendredi">Vendredi</SelectItem>
                <SelectItem value="peu_importe">Peu importe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="preferredTime-compact" className={labelClass}>
              Créneau horaire
            </Label>
            <Select
              value={formData.preferredTime}
              onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Choisir un créneau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9h-12h">9h - 12h</SelectItem>
                <SelectItem value="12h-14h">12h - 14h</SelectItem>
                <SelectItem value="14h-17h">14h - 17h</SelectItem>
                <SelectItem value="17h-19h">17h - 19h</SelectItem>
                <SelectItem value="peu_importe">Peu importe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button"
              size="lg" 
              variant="outline"
              className={`flex-1 ${isLight ? "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" : ""}`}
              onClick={() => setStep(1)}
            >
              Retour
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              variant={isLight ? "white" : "default"}
              className="flex-1 gap-2" 
              disabled={isSubmitting}
            >
              <Phone className="w-4 h-4" />
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </>
      )}

      <p className={`text-xs text-center ${isLight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
        {step === 1 ? "Étape 1/2" : "Étape 2/2"} • Rappel sous 2h
      </p>
    </form>
  );
};

export default CallbackFormCompact;
