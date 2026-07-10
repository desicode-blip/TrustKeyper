import React, { type ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { cn } from "@/lib/utils";

export interface MarketingLayoutProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
}

export function MarketingLayout({ children, className, hideNav = false }: MarketingLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-marketing-bg", className)}>
      {!hideNav ? <MarketingNav /> : null}
      <main className={cn("flex flex-1 flex-col", !hideNav && "pt-[88px] sm:pt-[96px]")}>
        {children}
      </main>
    </div>
  );
}
