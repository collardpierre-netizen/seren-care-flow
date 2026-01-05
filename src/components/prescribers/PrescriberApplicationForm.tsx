import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Send, Building2, User, Mail, Phone, MapPin, Users, Loader2 } from "lucide-react";

const organizationTypes = [
  { value: "institution", label: "Établissement de santé (EHPAD, Hôpital, Clinique)" },
  { value: "doctor", label: "Médecin" },
  { value: "nurse", label: "Infirmier(ère)" },
  { value: "pharmacist", label: "Pharmacien(ne)" },
  { value: "other", label: "Autre professionnel de santé" },
];

const patientCountOptions = [
  { value: "1-10", label: "1 à 10 patients" },
  { value: "11-50", label: "11 à 50 patients" },
  { value: "51-100", label: "51 à 100 patients" },
  { value: "100+", label: "Plus de 100 patients" },
];

export function PrescriberApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organizationName: "",
    organizationType: "",
    jobTitle: "",
    address: "",
    city: "",
    postalCode: "",
    patientCount: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.organizationType) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("prescriber_applications").insert({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organization_name: formData.organizationName.trim() || null,
        organization_type: formData.organizationType,
        job_title: formData.jobTitle.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        postal_code: formData.postalCode.trim() || null,
        patient_count: formData.patientCount || null,
        message: formData.message.trim() || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Candidature envoyée",
        description: "Nous reviendrons vers vous dans les plus brefs délais.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Candidature reçue !
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Merci pour votre intérêt. Notre équipe commerciale vous contactera dans les 48h 
          pour discuter de notre partenariat.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-6 md:p-8 shadow-lg"
    >
      <div className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informations personnelles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Coordonnées
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                required
              />
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Informations professionnelles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationType">Type d'activité *</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) => handleChange("organizationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Fonction</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="Ex: Directeur, Médecin coordinateur..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="organizationName">Nom de l'établissement</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleChange("organizationName", e.target.value)}
                placeholder="Nom de votre établissement ou cabinet"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localisation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Numéro et rue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="59000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Lille"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Informations complémentaires
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientCount">Nombre de patients concernés</Label>
              <Select
                value={formData.patientCount}
                onValueChange={(value) => handleChange("patientCount", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {patientCountOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Décrivez vos besoins ou posez-nous vos questions..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer ma candidature
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe 
          commerciale. Vos données sont traitées conformément à notre{" "}
          <a href="/confidentialite" className="text-primary hover:underline">
            politique de confidentialité
          </a>.
        </p>
      </div>
    </motion.form>
  );
}
