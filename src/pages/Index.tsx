import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CTASection from "@/components/home/CTASection";
import SubscriptionBenefits from "@/components/subscription/SubscriptionBenefits";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import OrderingPaths from "@/components/home/OrderingPaths";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>SerenCare | Protections pour adultes livrées en Belgique</title>
        <meta 
          name="description" 
          content="Retrouvez et commandez des protections pour adultes. Achat ponctuel ou livraison régulière, aide au choix et livraison en Belgique." 
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <OrderingPaths />
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

