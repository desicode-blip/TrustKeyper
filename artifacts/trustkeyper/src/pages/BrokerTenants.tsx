import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, User, Phone, MessageCircle, Send } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { getTenants, timeAgo, type Tenant } from "@/lib/tenants";

function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export default function BrokerTenants() {
  const [active, setActive] = useState("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setTenants(getTenants());
  }, []);

  const counts = {
    all: tenants.length,
    new: tenants.filter((t) => !t.invitationSent).length,
    interested: 0,
    invitation: tenants.filter((t) => t.invitationSent).length,
  };

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "new", label: "New", count: counts.new },
    { id: "interested", label: "Interested", count: counts.interested },
    { id: "invitation", label: "Invitation Sent", count: counts.invitation },
  ];

  const visibleTenants = tenants.filter((t) => {
    if (active === "all") return true;
    if (active === "new") return !t.invitationSent;
    if (active === "invitation") return t.invitationSent;
    return false;
  });

  return (
    <BrokerLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tenant Leads <span className="text-gray-900">({counts.all})</span>
        </h1>
        <button
          onClick={() => setLocation("/broker/tenants/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> Register Tenant Lead
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 flex-wrap">
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

      {visibleTenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-4">
            <User size={28} />
          </div>
          <p className="text-gray-500 font-medium mb-1">No leads yet</p>
          <p className="text-sm text-gray-400">
            Start by onboarding tenants on TrustKeyper
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTenants.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center text-base font-semibold">
                    {getInitial(t.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {t.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 flex-wrap gap-3">
                <p className="text-xs text-gray-500">
                  Added {timeAgo(t.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                    <Phone size={14} /> Call
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:bg-primary/90">
                    <Send size={14} /> Send Invite
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
