import React from "react";
import { cn } from "@/lib/utils";
import logoBrand from "@assets/Trustkeyper_Logo_1777989635996.png";
import logoLight from "@assets/trustkeyper_logo_light.png";

export type TrustKeyperLogoVariant = "brand" | "inverse";

export interface TrustKeyperLogoProps {
  /** `brand` = colored wordmark (headers). `inverse` = official white logo (footer, dark UI). */
  variant?: TrustKeyperLogoVariant;
  className?: string;
}

/**
 * TrustKeyper wordmark — uses exported brand assets (no upscaled low-res PNGs).
 */
export function TrustKeyperLogo({
  variant = "brand",
  className,
}: TrustKeyperLogoProps) {
  const src = variant === "inverse" ? logoLight : logoBrand;

  return (
    <img
      src={src}
      alt="TrustKeyper"
      draggable={false}
      className={cn("block h-auto w-auto max-w-full shrink-0 select-none", className)}
    />
  );
}
