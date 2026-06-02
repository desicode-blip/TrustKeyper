import React, { useState } from "react";
import { ChevronLeft, Ticket } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
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

        <FlowSegmentTabs
          value={activeTab}
          onChange={setActiveTab}
          className="mb-8"
          options={TABS.map((t) => ({ value: t.id, label: t.label }))}
        />

        <OwnerPageEmpty
          icon={Ticket}
          title="No tickets"
          description="Maintenance requests from tenants will appear here when this feature is enabled."
        />
      </div>
    </OwnerLayout>
  );
}
