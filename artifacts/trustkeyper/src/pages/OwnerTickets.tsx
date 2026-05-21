import React, { useState } from "react";
import { ChevronLeft, Ticket } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending Approval" },
  { id: "inprogress", label: "In Progress" },
  { id: "completed", label: "Completed" },
] as const;

export default function OwnerTickets() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 hover:underline w-fit"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Maintenance Tickets</h1>

        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-md p-1 w-fit overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`h-9 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap ${
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
          icon={Ticket}
          title="No tickets"
          description="Maintenance requests from tenants will appear here when this feature is enabled."
        />
      </div>
    </OwnerLayout>
  );
}
