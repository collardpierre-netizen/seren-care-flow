import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import CallbackForm from "./CallbackForm";
import { AppointmentDialog } from "@/components/AppointmentDialog";
const CTASection = () => {
  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-br from-muted to-muted/50 border border-border/60 p-10 md:p-16 overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Text */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Besoin d'un conseil personnalisé ?
              </h2>

              <p className="text-lg text-muted-foreground mb-6">
                Laissez-nous vos coordonnées et nous vous rappellerons pour répondre à vos questions 
                et vous guider vers la solution adaptée. Sans pression, sans engagement.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Link to="/aide-au-choix">
                    Répondre au questionnaire
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <AppointmentDialog
                  trigger={
                    <Button variant="ghost" size="lg" className="gap-2">
                      <Calendar className="w-5 h-5" />
                      Prendre rendez-vous
                    </Button>
                  }
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Ou remplissez le formulaire ci-contre pour être rappelé(e).
              </p>
            </div>

            {/* Right side - Form */}
            <div className="bg-background rounded-2xl p-6 md:p-8 shadow-lg border border-border/40">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Demander un rappel
              </h3>
              <CallbackForm />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
