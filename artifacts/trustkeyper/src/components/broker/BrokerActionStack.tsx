import React from "react";
import { FilePlus2, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrokerActionStackProps {
  onGenerateAgreement: () => void;
  onAddProperty: () => void;
  onAddTenant: () => void;
  className?: string;
}

const secondaryCtaClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary bg-white px-3 text-sm font-semibold text-gray-700 transition-all hover:bg-primary/5 active:scale-[0.99]";

/**
 * Mobile-only broker actions: primary full-width, two secondary CTAs below (50/50).
 */
export function BrokerActionStack({
  onGenerateAgreement,
  onAddProperty,
  onAddTenant,
  className,
}: BrokerActionStackProps) {
  return (
    <div className={cn("flex w-full max-w-md flex-col gap-3 md:hidden", className)}>
      <button
        type="button"
        onClick={onGenerateAgreement}
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.99]"
      >
        <FilePlus2 size={18} strokeWidth={2.25} />
        <span>Generate Rent Agreement</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onAddTenant} className={secondaryCtaClass}>
          <UserPlus size={16} className="shrink-0 text-primary" />
          <span className="truncate">Add Tenant</span>
        </button>
        <button type="button" onClick={onAddProperty} className={secondaryCtaClass}>
          <Plus size={16} className="shrink-0 text-primary" />
          <span className="truncate">Add Property</span>
        </button>
      </div>
    </div>
  );
}
