import React, { type ReactNode } from "react";
import { HomeownerMarketingNav } from "@/components/marketing/HomeownerMarketingNav";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { cn } from "@/lib/utils";

export interface MarketingLayoutProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
  navVariant?: "default" | "homeowner";
}

export function MarketingLayout({
  children,
  className,
  hideNav = false,
  navVariant = "default",
}: MarketingLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-marketing-bg", className)}>
      {!hideNav ? (navVariant === "homeowner" ? <HomeownerMarketingNav /> : <MarketingNav />) : null}
      <main className={cn("flex flex-1 flex-col", !hideNav && "pt-[88px] sm:pt-[96px]")}>
        {children}
      </main>
    </div>
  );
}
