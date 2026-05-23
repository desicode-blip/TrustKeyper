import React from "react";
import { AlertCircle } from "lucide-react";
import {
  formatTicketReportedAt,
  type PropertyMaintenanceTicket,
} from "@/lib/ownerPropertyMaintenance";

type MaintenanceTicketCardProps = {
  ticket: PropertyMaintenanceTicket;
  thumbnailUrl?: string;
};

const STATUS_STYLES: Record<PropertyMaintenanceTicket["status"], string> = {
  New: "bg-[#0088CC] text-white",
  "In Progress": "bg-amber-500 text-white",
  Completed: "bg-gray-500 text-white",
};

export function MaintenanceTicketCard({ ticket, thumbnailUrl }: MaintenanceTicketCardProps) {
  const ticketLabel = `Ticket- ${String(ticket.ticketNumber).padStart(2, "0")}`;
  const isUrgent = ticket.priority === "Urgent";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-500" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-gray-800">{ticketLabel}</span>
          {isUrgent && (
            <span className="text-sm font-bold text-red-600">Urgent</span>
          )}
        </div>
        <span
          className={`shrink-0 rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[ticket.status]}`}
        >
          {ticket.status}
        </span>
      </div>

      <div className="flex gap-4">
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-medium text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#768EA7]">{ticket.category}</p>
          <p className="mt-0.5 text-base font-bold leading-snug text-[#1A2B4B]">{ticket.title}</p>
          <p className="mt-2 text-xs text-gray-500">
            Reported on {formatTicketReportedAt(ticket.reportedAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
