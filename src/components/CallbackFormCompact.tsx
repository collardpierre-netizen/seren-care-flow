import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallbackFormCompactProps {
  variant?: "default" | "light";
}

const CallbackFormCompact = ({ variant = "default" }: CallbackFormCompactProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label 
            htmlFor="firstName-compact" 
            className={isLight ? "text-primary-foreground/90 text-xs" : "text-xs"}
          >
            Prénom *
          </Label>
          <Input
            id="firstName-compact"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Prénom"
            className={isLight 
              ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-9" 
              : "h-9"
            }
          />
        </div>
        <div className="space-y-1">
          <Label 
            htmlFor="lastName-compact" 
            className={isLight ? "text-primary-foreground/90 text-xs" : "text-xs"}
          >
            Nom *
          </Label>
          <Input
            id="lastName-compact"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Nom"
            className={isLight 
              ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-9" 
              : "h-9"
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label 
          htmlFor="phone-compact" 
          className={isLight ? "text-primary-foreground/90 text-xs" : "text-xs"}
        >
          Téléphone *
        </Label>
        <Input
          id="phone-compact"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="06 12 34 56 78"
          className={isLight 
            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-9" 
            : "h-9"
          }
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        variant={isLight ? "white" : "default"}
        className="w-full gap-2" 
        disabled={isSubmitting}
      >
        <Phone className="w-5 h-5" />
        {isSubmitting ? "Envoi..." : "Demander un rappel"}
      </Button>

      <p className={`text-xs text-center ${isLight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
        Rappel sous 2h, 7j/7
      </p>
    </form>
  );
};

export default CallbackFormCompact;
