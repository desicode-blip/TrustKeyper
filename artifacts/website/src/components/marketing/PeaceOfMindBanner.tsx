import React from "react";
import { motion } from "framer-motion";
import peaceOfMindBanner from "@/assets/marketing/Frame 1597880554.png";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useFooterHouseReveal } from "@/hooks/useFooterHouseReveal";

export function PeaceOfMindBanner() {
  const { sectionRef, bannerY, bannerOpacity, footerOverlap } = useFooterHouseReveal();

  return (
    <section
      ref={sectionRef}
      className="relative mt-auto bg-white pb-0 pt-2 sm:pt-4"
      aria-label="Peace of mind"
    >
      <div className="relative z-10 overflow-hidden">
        <div className="mx-auto w-full max-w-[1692px]">
          <motion.img
            src={peaceOfMindBanner}
            alt="Keyper of Your Peace of Mind."
            style={{ y: bannerY, opacity: bannerOpacity }}
            className="block h-auto w-full will-change-transform"
            draggable={false}
          />
        </div>
      </div>

      <motion.div className="relative z-20 shrink-0" style={{ marginTop: footerOverlap }}>
        <MarketingFooter />
      </motion.div>
    </section>
  );
}
