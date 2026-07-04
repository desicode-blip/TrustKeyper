import React from "react";
import { X } from "lucide-react";
import authModalHeader from "@/assets/marketing/auth-modal-header.png";
import logoLight from "@/assets/marketing/logo light.svg";
import { cn } from "@/lib/utils";

export interface MarketingAuthModalHeaderProps {
  variant: "illustration" | "brand";
  onClose: () => void;
}

export function MarketingAuthModalHeader({ variant, onClose }: MarketingAuthModalHeaderProps) {
  return (
    <div className="relative shrink-0">
      {variant === "illustration" ? (
        <img
          src={authModalHeader}
          alt=""
          className="block h-auto w-full object-cover"
          draggable={false}
          aria-hidden
        />
      ) : (
        <div className="flex h-[120px] items-center justify-center bg-gradient-to-b from-[#305eff] to-[#6b93ff] sm:h-[132px]">
          <img
            src={logoLight}
            alt="TrustKeyper"
            className="h-10 w-auto sm:h-11"
            draggable={false}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close login dialog"
        className={cn(
          "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 text-marketing-navy transition-colors hover:bg-white",
          variant === "brand" ? "border-white/70" : "border-[#cbd5e2]",
        )}
      >
        <X size={18} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
