import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CallbackForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    preferredDay: "",
    preferredTime: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store the callback request in the database using type assertion for new table
      const { error } = await (supabase.from("callback_requests" as any) as any).insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email || null,
        preferred_day: formData.preferredDay || null,
        preferred_time: formData.preferredTime || null,
        message: formData.message || null,
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
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Demande enregistrée !
        </h3>
        <p className="text-muted-foreground">
          Notre équipe vous rappellera dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Votre prénom"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Votre nom"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="06 12 34 56 78"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optionnel)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="votre@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferredDay">Jour de préférence</Label>
          <Select
            value={formData.preferredDay}
            onValueChange={(value) => setFormData({ ...formData, preferredDay: value })}
          >
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label htmlFor="preferredTime">Créneau horaire</Label>
          <Select
            value={formData.preferredTime}
            onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
          >
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (optionnel)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Décrivez brièvement votre situation ou vos questions..."
          rows={3}
        />
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
        <Phone className="w-5 h-5" />
        {isSubmitting ? "Envoi en cours..." : "Demander un rappel"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Nous vous rappellerons du lundi au vendredi, entre 9h et 19h.
      </p>
    </form>
  );
};

export default CallbackForm;
