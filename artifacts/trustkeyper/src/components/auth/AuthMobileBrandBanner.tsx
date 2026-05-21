import React from "react";
import { TrustKeyperLogo } from "@/components/brand";
import bannerPattern from "@assets/auth_mobile_banner_bg.png";

/**
 * Mobile signup/login header (replaces desktop sidebar branding).
 * @see Figma mobile auth frames — blue band + TrustKeyper wordmark.
 */
export function AuthMobileBrandBanner() {
  return (
    <div className="lg:hidden relative w-full overflow-hidden bg-[#1E4FD9] shrink-0">
      <img
        src={bannerPattern}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
        aria-hidden
      />
      <div className="relative flex items-center justify-center py-6 px-6">
        <TrustKeyperLogo
          variant="inverse"
          className="h-12 w-[10.75rem] max-w-[min(100%,220px)]"
        />
      </div>
    </div>
  );
}
