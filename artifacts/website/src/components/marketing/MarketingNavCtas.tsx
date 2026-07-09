import React from "react";
import { Link } from "wouter";
import { MarketingAuthTrigger } from "@/components/auth/MarketingAuthTrigger";
import { MARKETING_CTA } from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

export const marketingNavCtaClassName =
  "inline-flex items-center justify-center rounded-full px-6 py-3 font-roboto text-base font-medium transition-colors";

export function MarketingSignupLoginCta({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <MarketingAuthTrigger
      onClick={onClick}
      className={cn(
        marketingNavCtaClassName,
        "bg-marketing-neutral-1100 text-white hover:bg-marketing-neutral-1000",
        className,
      )}
    >
      Sign Up/Login
    </MarketingAuthTrigger>
  );
}

export function MarketingContactUsCta({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={MARKETING_CTA.contactUs}
      onClick={onClick}
      className={cn(
        marketingNavCtaClassName,
        "border border-[#b4cdfd] bg-transparent text-marketing-neutral-1100 hover:bg-white/70",
        className,
      )}
    >
      Contact Us
    </Link>
  );
}
