import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import SubscriptionFAQ from '@/components/faq/SubscriptionFAQ';
import SubscriptionBenefits from '@/components/subscription/SubscriptionBenefits';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Phone } from 'lucide-react';

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>FAQ - Questions fréquentes | SerenCare</title>
        <meta 
          name="description" 
          content="Retrouvez toutes les réponses à vos questions sur les abonnements, la livraison, les produits et les retours SerenCare." 
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-sm font-medium text-primary mb-6">
                <HelpCircle className="w-4 h-4" />
                Centre d'aide
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Questions fréquentes
              </h1>
              <p className="text-lg text-muted-foreground">
                Retrouvez toutes les réponses à vos questions sur SerenCare, 
                nos abonnements, la livraison et nos produits.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 lg:py-20">
          <div className="container-main max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SubscriptionFAQ />
            </motion.div>
          </div>
        </section>

        {/* Subscription Benefits */}
        <SubscriptionBenefits />

        {/* Contact CTA */}
        <section className="py-16 bg-muted/50">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Vous n'avez pas trouvé votre réponse ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe est là pour vous aider. Contactez-nous par téléphone 
                ou par email, nous vous répondons sous 24h.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/contact" className="gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Nous contacter
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:0800123456" className="gap-2">
                    <Phone className="w-5 h-5" />
                    0 800 123 456
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default FAQ;
