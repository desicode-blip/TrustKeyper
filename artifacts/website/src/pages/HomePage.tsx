import React from "react";
import { HomeownerHeroSection } from "@/components/marketing/HomeownerHeroSection";
import { HomeownerPropertyManagedSection } from "@/components/marketing/HomeownerPropertyManagedSection";
import { HomeownerServicesGrid } from "@/components/marketing/HomeownerServicesGrid";
import { HomeownerTrustBadgesStrip } from "@/components/marketing/HomeownerTrustBadgesStrip";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export function HomePage() {
  return (
    <MarketingLayout>
      <HomeownerHeroSection />
      <HomeownerTrustBadgesStrip />
      <HomeownerPropertyManagedSection />
      <HomeownerServicesGrid />
    </MarketingLayout>
  );
}
