import React, { useState } from "react";
import { ChevronLeft, Ticket, Wrench } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { RaiseComplaintModal } from "@/components/owner/RaiseComplaintModal";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending Approval" },
  { id: "inprogress", label: "In Progress" },
  { id: "completed", label: "Completed" },
] as const;

export default function OwnerTickets() {
  const [activeTab, setActiveTab] = useState("all");
  const [logOpen, setLogOpen] = useState(false);

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Tickets</h1>
          <Button type="button" size="sm" className="gap-2 h-10 w-fit" onClick={() => setLogOpen(true)}>
            <Wrench size={16} /> + Log Maintenance
          </Button>
        </div>

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
      <RaiseComplaintModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSubmitted={() => {
          /* owner tickets page still uses empty state; modal handles storage update */
        }}
      />
    </OwnerLayout>
  );
}
