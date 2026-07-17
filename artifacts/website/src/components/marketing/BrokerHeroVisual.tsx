import React from "react";
import heroBlueCurve from "@/assets/marketing/brokers/hero/hero-blue-curve.svg";
import heroHandPhone from "@/assets/marketing/brokers/hero/hero-hand-phone.png";
import heroPhoneScreenMobile from "@/assets/marketing/brokers/hero/hero-phone-screen-mobile.png";
import { cn } from "@/lib/utils";

export interface BrokerHeroVisualProps {
  className?: string;
}

/**
 * Desktop: hand PNG flush bottom-right; blue-curve stripes localized
 * behind the hand so only the visible half peeks out (per design reference).
 */
export function BrokerHeroVisualDesktop({ className }: BrokerHeroVisualProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 hidden lg:block", className)}>
      {/*
        Stripe tucked into the bottom-right behind the hand — sized so only
        the portion that extends past the hand is visible, not the full motif.
      */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-[380px] w-[580px] overflow-hidden"
        aria-hidden
      >
        <img
          src={heroBlueCurve}
          alt=""
          className="absolute bottom-[-15%] right-[-35%] h-[360px] w-[900px] max-w-none rotate-[-22deg] object-contain object-right"
          draggable={false}
        />
      </div>

      {/* Hand — slightly reduced, still stuck to bottom-right */}
      <div className="absolute bottom-0 right-0 z-10 h-[620px] w-[485px]">
        <img
          src={heroHandPhone}
          alt="Hand holding a phone showing the TrustKeyper broker portal"
          className="h-full w-full object-cover object-bottom-right mix-blend-lighten"
          draggable={false}
        />
      </div>
    </div>
  );
}

/**
 * Mobile: phone-screen asset (no hand) with a small stripe accent.
 */
export function BrokerHeroVisualMobile({ className }: BrokerHeroVisualProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[280px] lg:hidden", className)}>
      <div
        className="pointer-events-none absolute -right-10 bottom-[-8%] z-0 h-[200px] w-[280px] rotate-[-22deg] sm:-right-14 sm:h-[240px] sm:w-[340px]"
        aria-hidden
      >
        <img
          src={heroBlueCurve}
          alt=""
          className="h-full w-full object-contain opacity-80"
          draggable={false}
        />
      </div>

      <img
        src={heroPhoneScreenMobile}
        alt="TrustKeyper broker portal on a phone"
        className="relative z-10 mx-auto h-auto w-full object-contain object-top"
        draggable={false}
      />
    </div>
  );
}
