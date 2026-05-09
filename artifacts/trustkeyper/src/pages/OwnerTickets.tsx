import React, { useState } from "react";
import { ChevronLeft, X, Check, Plus } from "lucide-react";
import { useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "pending", label: "Pending Approval" },
  { id: "inprogress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export default function OwnerTickets() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Local state for tickets
  const [tickets, setTickets] = useState([
    {
      id: "Ticket-01",
      status: "New",
      urgency: "Urgent",
      category: "Electrical",
      title: "AC Not Cooling Properly",
      property: "Aparna Sarovar Unit 803",
      date: "March 28, 2026, 10:30 AM",
      reportedOn: "April 10th, 2026",
      availability: "Sat 6-7 PM 4-5 PM"
    }
  ]);

  const handleApprove = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "In Progress" } : t));
    setSelectedTicketId(null);
  };

  const handleMarkDone = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "Completed" } : t));
  };

  const visibleTickets = tickets.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return t.status === "New";
    if (activeTab === "pending") return t.status === "Pending Approval";
    if (activeTab === "inprogress") return t.status === "In Progress";
    if (activeTab === "completed") return t.status === "Completed";
    return true;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button onClick={() => setLocation("/owner/dashboard")} className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Maintenance Tickets</h1>

        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-md p-1 w-fit overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`h-9 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visibleTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">No tickets found in this category.</div>
          ) : (
            visibleTickets.map(t => (
              <div key={t.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden shrink-0 hidden sm:block">
                      <div className="w-full h-full flex flex-col justify-end p-1 relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-70"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 font-medium">⚠️ {t.id}</span>
                        <span className="text-xs font-bold text-red-600">{t.urgency}</span>
                        {t.status === "New" && <span className="bg-[#0A84FF] text-white text-[10px] px-2 py-0.5 rounded font-medium">New</span>}
                        {t.status === "In Progress" && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-medium">Work in progress</span>}
                      </div>
                      {t.status === "In Progress" && <p className="text-xs text-gray-500 mb-0.5">{t.category}</p>}
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        <span className="font-bold">{t.title}</span> at {t.property}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Reported on {t.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button onClick={() => setSelectedTicketId(t.id)} className="h-9 px-4 rounded border border-primary text-primary text-sm font-medium hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                    {t.status === "In Progress" && (
                      <button onClick={() => handleMarkDone(t.id)} className="h-9 px-4 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                        Mark as done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[#F5F7FA]">
            <DialogTitle className="sr-only">Repair Details</DialogTitle>
            <DialogDescription className="sr-only">Repair Details Modal</DialogDescription>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Repair Details</h2>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded bg-[#2D31A6] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-[#2D31A6]/90">
                  <Plus size={14} /> Raise Complaint
                </button>
                <button onClick={() => setSelectedTicketId(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {selectedTicket && (
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <span className="text-red-500 border border-red-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold">!</span>
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs font-bold text-red-600">{selectedTicket.urgency}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Photos</h3>
                    <div className="bg-gray-200 h-48 rounded-lg overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=60')] bg-cover bg-center"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-200 h-24 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60')] bg-cover bg-center"></div>
                      </div>
                      <div className="bg-gray-200 h-24 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60')] bg-cover bg-center"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tenant Report</h3>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-start gap-3 p-4 border-b border-gray-50">
                        <div className="w-5 flex justify-center mt-0.5"><span className="text-[10px]">🏷️</span></div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Category</p>
                          <p className="text-sm font-medium text-gray-900">{selectedTicket.category}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 border-b border-gray-50">
                        <div className="w-5 flex justify-center mt-0.5"><span className="text-[10px]">📅</span></div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Reported on</p>
                          <p className="text-sm font-medium text-gray-900">{selectedTicket.reportedOn}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 border-b border-gray-50">
                        <div className="w-5 flex justify-center mt-0.5"><span className="text-[10px]">🏠</span></div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Property details</p>
                          <p className="text-sm font-medium text-gray-900">{selectedTicket.property}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 border-b border-gray-50">
                        <div className="w-5 flex justify-center mt-0.5"><span className="text-[10px]">💬</span></div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Description</p>
                          <p className="text-sm font-medium text-gray-900">{selectedTicket.title}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-5 flex justify-center mt-0.5"><span className="text-[10px]">🕒</span></div>
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Tenant Availability</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">Sat</span>
                            <span className="text-xs font-medium text-gray-900">{selectedTicket.availability.split(" ")[1]} {selectedTicket.availability.split(" ")[2]}</span>
                            <span className="text-xs font-medium text-gray-900">{selectedTicket.availability.split(" ")[3]} {selectedTicket.availability.split(" ")[4]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTicket.status === "New" && (
                  <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <button className="w-12 h-12 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors border border-red-100 shadow-sm">
                      <X size={24} />
                    </button>
                    <button onClick={() => handleApprove(selectedTicket.id)} className="w-12 h-12 rounded bg-[#0A84FF] text-white flex items-center justify-center hover:bg-[#0A84FF]/90 transition-colors shadow-sm">
                      <Check size={24} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OwnerLayout>
  );
}
