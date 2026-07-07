import React, { useEffect } from "react";
import { useMarketingAuthModal } from "@/components/auth/MarketingAuthModalContext";

/** Opens the auth modal when users land on /login (combined staging deploy). */
export function MarketingLoginEntryPage() {
  const { openAuthModal } = useMarketingAuthModal();

  useEffect(() => {
    openAuthModal();
  }, [openAuthModal]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-marketing-bg">
      <p className="text-sm text-marketing-muted">Opening login...</p>
    </div>
  );
}
