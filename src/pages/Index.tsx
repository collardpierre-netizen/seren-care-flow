import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CTASection from "@/components/home/CTASection";
import SubscriptionBenefits from "@/components/subscription/SubscriptionBenefits";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>SerenCare - Protections pour seniors livrées automatiquement</title>
        <meta 
          name="description" 
          content="SerenCare vous accompagne dans le choix des protections adaptées pour vos proches. Livraison automatique, accompagnement humain, sans engagement." 
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <HowItWorks />
        <TestimonialsSection />
        <SubscriptionBenefits />
        <BenefitsSection />
        <TrustSection />
        <CTASection />
      </Layout>
    </>
  );
};

export default Index;

