import React from "react";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PeaceOfMindBanner } from "@/components/marketing/PeaceOfMindBanner";
import { RentingFeaturesSection } from "@/components/marketing/RentingFeaturesSection";

export function HomePage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <RentingFeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PeaceOfMindBanner />
    </MarketingLayout>
  );
}
