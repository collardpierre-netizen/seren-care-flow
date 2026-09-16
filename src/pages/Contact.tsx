import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("callback_requests").insert({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: `[${formData.subject}] ${formData.message}`.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact - Nous contacter | SerenCare</title>
        <meta 
          name="description" 
          content="Contactez l'équipe SerenCare. Nous sommes disponibles du lundi au vendredi de 9h à 15h pour répondre à toutes vos questions." 
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Une question ?
                <br />
                <span className="text-primary">Parlons-en.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Notre équipe bienveillante est à votre disposition pour répondre 
                à toutes vos questions et vous accompagner.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Nos coordonnées
                </h2>
                <p className="text-muted-foreground mb-8">
                  SerenCare by Medikong — Notre équipe est disponible pour vous accompagner 
                  dans vos démarches.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground mb-1">Téléphone</p>
                      <a 
                        href="tel:+32498644130" 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +32 498 64 41 30
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground mb-1">Email</p>
                      <a 
                        href="mailto:info@serencare.be" 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        info@serencare.be
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground mb-1">Horaires</p>
                      <p className="text-muted-foreground">
                        Du lundi au vendredi<br />
                        de 9h à 15h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground mb-1">Adresse</p>
                      <p className="text-muted-foreground">
                        Av. de l'Hippodrome 148<br />
                        1050 Ixelles, Belgique
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">
                    Envoyez-nous un message
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Votre prénom"
                          required
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Votre nom"
                          required
                          maxLength={50}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+32 xxx xx xx xx"
                          required
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="De quoi souhaitez-vous parler ?"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Décrivez votre demande..."
                        rows={5}
                        required
                        maxLength={1000}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Utilisez ce formulaire pour une question sur le service ou les caractéristiques d’un produit. Pour un avis médical, adressez-vous à un professionnel de santé.
                    </p>
                    <div className="flex items-start gap-3">
                      <Checkbox id="contact-privacy" checked={privacyAccepted} onCheckedChange={(checked) => setPrivacyAccepted(checked === true)} className="mt-1 h-5 w-5" />
                      <Label htmlFor="contact-privacy" className="text-sm font-normal leading-relaxed">
                        J’ai lu la <Link to="/confidentialite" className="underline underline-offset-2">politique de confidentialité</Link> et j’accepte que SerenCare utilise ces informations pour répondre à ma demande.
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full gap-2"
                      disabled={isSubmitting || !privacyAccepted}
                    >
                      {isSubmitting ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          Envoyer le message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Contact;
