import React, { useState } from "react";
import { Plus, User } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";

const tabs = [
  { id: "all", label: "All", count: 15 },
  { id: "new", label: "New", count: 6 },
  { id: "interested", label: "Interested", count: 2 },
  { id: "invitation", label: "Invitation Sent", count: 0 },
];

export default function BrokerTenants() {
  const [active, setActive] = useState("all");
  const total = tabs.find((t) => t.id === "all")?.count ?? 0;

  return (
    <BrokerLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tenant Leads <span className="text-gray-900">({total})</span>
        </h1>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> Register Tenant Lead
        </button>
      </div>

      <div className="flex items-center gap-2 mb-10 flex-wrap">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-4">
          <User size={28} />
        </div>
        <p className="text-gray-500 font-medium mb-1">No leads yet</p>
        <p className="text-sm text-gray-400">
          Start by onboarding tenants on TrustKeyper
        </p>
      </div>
    </BrokerLayout>
  );
}
