import Hero from "./Hero";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import StatsSection from "./StatsSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialsSection";
import CtaBanner from "./CtaBanner";
import FaqSection from "./FaqSection";

const HomePage = () => {
  return (
    <div className="px-4 py-6 sm:px-6">
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaBanner />
      <FaqSection />
    </div>
  );
};

export default HomePage;
