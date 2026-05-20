import React from "react";
import { Plus, UserPlus } from "lucide-react";
import { BrokerActionStack, type BrokerActionStackProps } from "./BrokerActionStack";

/** Dashboard header CTAs: horizontal row on md+, stacked hierarchy on mobile. */
export function BrokerDashboardHeaderActions(props: BrokerActionStackProps) {
  const { onGenerateAgreement, onAddProperty, onAddTenant, className } = props;

  return (
    <>
      <div
        className={`hidden md:flex items-center gap-3 flex-wrap shrink-0 ${className ?? ""}`}
      >
        <button
          type="button"
          onClick={onAddTenant}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white border border-primary text-gray-700 text-sm font-semibold hover:bg-primary/5 transition-all active:scale-95"
        >
          <UserPlus size={16} className="text-primary" /> Add Tenant
        </button>
        <button
          type="button"
          onClick={onAddProperty}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white border border-primary text-gray-700 text-sm font-semibold hover:bg-primary/5 transition-all active:scale-95"
        >
          <Plus size={16} className="text-primary" /> Add Property
        </button>
        <button
          type="button"
          onClick={onGenerateAgreement}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Generate Rent Agreement
        </button>
      </div>
      <BrokerActionStack
        onGenerateAgreement={onGenerateAgreement}
        onAddProperty={onAddProperty}
        onAddTenant={onAddTenant}
        className={className}
      />
    </>
  );
}
