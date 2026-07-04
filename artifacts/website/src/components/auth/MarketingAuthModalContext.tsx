import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MarketingAuthModal } from "@/components/auth/MarketingAuthModal";

export interface MarketingAuthVerifiedPayload {
  phone: string;
  rememberMe: boolean;
  otp: string;
}

interface MarketingAuthModalContextValue {
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const MarketingAuthModalContext = createContext<MarketingAuthModalContextValue | null>(null);

export interface MarketingAuthModalProviderProps {
  children: React.ReactNode;
  onAuthVerified?: (payload: MarketingAuthVerifiedPayload) => void;
}

export function MarketingAuthModalProvider({
  children,
  onAuthVerified,
}: MarketingAuthModalProviderProps) {
  const [open, setOpen] = useState(false);

  const openAuthModal = useCallback(() => setOpen(true), []);
  const closeAuthModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen: open,
    }),
    [closeAuthModal, open, openAuthModal],
  );

  return (
    <MarketingAuthModalContext.Provider value={value}>
      {children}
      <MarketingAuthModal
        open={open}
        onOpenChange={setOpen}
        onAuthVerified={onAuthVerified}
      />
    </MarketingAuthModalContext.Provider>
  );
}

export function useMarketingAuthModal(): MarketingAuthModalContextValue {
  const context = useContext(MarketingAuthModalContext);
  if (!context) {
    throw new Error("useMarketingAuthModal must be used within MarketingAuthModalProvider");
  }
  return context;
}
