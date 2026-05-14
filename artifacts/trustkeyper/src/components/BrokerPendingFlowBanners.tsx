import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Building2, FileSignature, Users } from "lucide-react";
import {
  BROKER_PENDING_FLOWS_EVENT,
  getPendingFlowItems,
  type PendingFlowItem,
  type PendingFlowKind,
} from "@/lib/brokerPendingFlows";

const BANNER_BY_KIND: Record<
  PendingFlowKind,
  {
    panel: string;
    iconWrap: string;
    iconColor: string;
    halfFill: string;
  }
> = {
  add_property: {
    panel: "bg-[#FEF2E8] border border-[#FAD7C1]",
    iconWrap: "bg-white border border-[#FAD7C1]",
    iconColor: "text-orange-600",
    halfFill: "bg-orange-400",
  },
  add_tenant: {
    panel: "bg-emerald-50 border border-emerald-200",
    iconWrap: "bg-white border border-emerald-200",
    iconColor: "text-emerald-600",
    halfFill: "bg-emerald-500",
  },
  agreement: {
    panel: "bg-sky-50 border border-sky-200",
    iconWrap: "bg-white border border-sky-200",
    iconColor: "text-sky-600",
    halfFill: "bg-sky-500",
  },
};

function PendingIcon({ kind }: { kind: PendingFlowKind }) {
  const cfg = BANNER_BY_KIND[kind];
  const Icon = kind === "add_property" ? Building2 : kind === "add_tenant" ? Users : FileSignature;
  return (
    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${cfg.iconWrap}`}>
      <div className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white/90 ring-1 ring-black/5">
        <div className={`absolute inset-y-0 left-0 w-1/2 ${cfg.halfFill} opacity-85`} aria-hidden />
        <Icon size={13} className={`relative z-[1] ${cfg.iconColor}`} strokeWidth={2.25} />
      </div>
    </div>
  );
}

function PendingRow({ item }: { item: PendingFlowItem }) {
  const cfg = BANNER_BY_KIND[item.kind];
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 rounded-[10px] px-4 py-3.5 sm:px-5 shadow-sm ${cfg.panel}`}
      role="status"
    >
      <PendingIcon kind={item.kind} />
      <p className="flex-1 min-w-0 text-sm font-medium leading-snug text-gray-900">
        {item.title}
      </p>
      <Link
        href={item.continueHref}
        className="inline-flex items-center justify-center shrink-0 h-9 px-4 rounded-lg bg-white border border-primary text-primary text-sm font-semibold shadow-sm hover:bg-primary/5 transition-colors"
      >
        Continue
      </Link>
    </div>
  );
}

export default function BrokerPendingFlowBanners({ className = "" }: { className?: string }) {
  const [items, setItems] = useState<PendingFlowItem[]>(() =>
    typeof window !== "undefined" ? getPendingFlowItems() : [],
  );

  useEffect(() => {
    const sync = () => setItems(getPendingFlowItems());
    sync();
    window.addEventListener(BROKER_PENDING_FLOWS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BROKER_PENDING_FLOWS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <PendingRow key={item.kind} item={item} />
      ))}
    </div>
  );
}
