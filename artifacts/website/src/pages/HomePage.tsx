import React from "react";
import { HomeownerAccountableTeamSection } from "@/components/marketing/HomeownerAccountableTeamSection";
import { HomeownerFaqSection } from "@/components/marketing/HomeownerFaqSection";
import { HomeownerHeroSection } from "@/components/marketing/HomeownerHeroSection";
import { HomeownerHowItWorksSection } from "@/components/marketing/HomeownerHowItWorksSection";
import { HomeownerPropertyManagedSection } from "@/components/marketing/HomeownerPropertyManagedSection";
import { HomeownerServicesGrid } from "@/components/marketing/HomeownerServicesGrid";
import { HomeownerTransparencySection } from "@/components/marketing/HomeownerTransparencySection";
import { HomeownerTrustBadgesStrip } from "@/components/marketing/HomeownerTrustBadgesStrip";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export function HomePage() {
  return (
    <MarketingLayout navVariant="homeowner">
      <HomeownerHeroSection />
      <HomeownerTrustBadgesStrip />
      <HomeownerPropertyManagedSection />
      <HomeownerServicesGrid />
      <HomeownerHowItWorksSection />
      <HomeownerAccountableTeamSection />
      <HomeownerTransparencySection />
      <HomeownerFaqSection />
    </MarketingLayout>
  );
}
