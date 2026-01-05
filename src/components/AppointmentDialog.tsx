import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentDialogProps {
  trigger?: React.ReactNode;
}

export function AppointmentDialog({ trigger }: AppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    appointmentType: "",
    preferredDay: "",
    preferredTime: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await (supabase.from("callback_requests" as any) as any).insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferred_day: formData.preferredDay || null,
        preferred_time: formData.preferredTime || null,
        message: `[Rendez-vous ${formData.appointmentType}] ${formData.message}`,
      });

      if (error) throw error;

      // Send confirmation email
      if (formData.email) {
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              type: 'appointment',
              to: formData.email,
              data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                preferredDay: formData.preferredDay,
                preferredTime: formData.preferredTime,
              }
            }
          });
        } catch (emailError) {
          console.log('Email notification failed, continuing anyway');
        }
      }

      setIsSubmitted(true);
      toast.success("Demande de rendez-vous envoyée !");
    } catch (error) {
      console.error("Error submitting appointment request:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="gap-2">
            <Calendar className="w-4 h-4" />
            Prendre rendez-vous
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Prendre rendez-vous
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Rendez-vous demandé !
            </h3>
            <p className="text-muted-foreground">
              Nous vous contacterons pour confirmer votre créneau.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <p className="text-muted-foreground text-sm">
              Choisissez le type de rendez-vous et vos disponibilités. Nous vous recontacterons pour confirmer.
            </p>

            <div className="space-y-2">
              <Label htmlFor="appointmentType">Type de rendez-vous *</Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Appel vidéo (15-30 min)</SelectItem>
                  <SelectItem value="phone">Appel téléphonique</SelectItem>
                  <SelectItem value="in-person">En pharmacie (Ixelles)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+32 XX XXX XX XX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDay">Jour souhaité</Label>
                <Select
                  value={formData.preferredDay}
                  onValueChange={(value) => setFormData({ ...formData, preferredDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lundi">Lundi</SelectItem>
                    <SelectItem value="mardi">Mardi</SelectItem>
                    <SelectItem value="mercredi">Mercredi</SelectItem>
                    <SelectItem value="jeudi">Jeudi</SelectItem>
                    <SelectItem value="vendredi">Vendredi</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Créneau</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9h-12h">9h - 12h</SelectItem>
                    <SelectItem value="12h-14h">12h - 14h</SelectItem>
                    <SelectItem value="14h-17h">14h - 17h</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
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
                placeholder="Précisez votre demande ou vos questions..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full gap-2" 
              disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.appointmentType}
            >
              <Calendar className="w-4 h-4" />
              {isSubmitting ? "Envoi en cours..." : "Demander ce rendez-vous"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Nous vous recontacterons sous 24h pour confirmer votre créneau.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
