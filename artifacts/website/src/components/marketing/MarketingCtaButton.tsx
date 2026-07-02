import React from "react";
import { MARKETING_CTA } from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

export interface MarketingCtaButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

export function MarketingCtaButton({
  href,
  children,
  variant = "primary",
  className,
}: MarketingCtaButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded px-5 py-3 text-sm font-semibold transition-colors sm:text-base",
        variant === "primary" &&
          "bg-marketing-blue text-white hover:bg-marketing-blue-bright",
        variant === "outline" &&
          "border border-marketing-border bg-white text-marketing-navy hover:border-marketing-muted/40 hover:bg-marketing-muted-bg",
        className,
      )}
    >
      {children}
    </a>
  );
}

export { MARKETING_CTA };
