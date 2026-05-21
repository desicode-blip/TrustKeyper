import React, { useState } from "react";
import { ChevronLeft, UserPlus, Users } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "inquiries", label: "Inquiries" },
  { id: "active", label: "Active Tenants" },
  { id: "past", label: "Past Tenants" },
] as const;

type TenantTab = (typeof TABS)[number]["id"];

const EMPTY_COPY: Record<TenantTab, { title: string; description: string }> = {
  inquiries: {
    title: "No inquiries yet",
    description: "When tenants show interest in your listings, they will appear here.",
  },
  active: {
    title: "No active tenants",
    description: "Tenants with an active lease will show up here once you onboard them.",
  },
  past: {
    title: "No past tenants",
    description: "Former tenants will be listed here after a lease ends.",
  },
};

export default function OwnerTenants() {
  const [activeTab, setActiveTab] = useState<TenantTab>("inquiries");

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline w-fit"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <Button className="rounded-xl border-0 font-semibold shadow-md shadow-primary/25 gap-2">
            <UserPlus size={18} />
            Invite Tenants
          </Button>
        </div>

        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-md p-1 w-fit max-w-full overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`h-9 px-4 sm:px-6 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <OwnerPageEmpty
          icon={Users}
          title={EMPTY_COPY[activeTab].title}
          description={EMPTY_COPY[activeTab].description}
        />
      </div>
    </OwnerLayout>
  );
}
