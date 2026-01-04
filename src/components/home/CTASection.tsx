import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Phone, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-background">
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
          
          <div className="relative max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Pas sûr de ce dont vous avez besoin ?
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Appelez-nous. Notre équipe répond à vos questions et vous guide vers la solution adaptée. 
              Sans pression, sans engagement.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                asChild
                size="lg"
                className="gap-2"
              >
                <a href="tel:0123456789">
                  <Phone className="w-5 h-5" />
                  01 23 45 67 89
                </a>
              </Button>
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
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Du lundi au vendredi, 9h-18h • Appel gratuit
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
