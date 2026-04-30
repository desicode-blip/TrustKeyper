import React, { useState } from "react";
import { Plus, Briefcase, LayoutGrid, Table as TableIcon, Calendar } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";

const tabs = [
  { id: "all", label: "All" },
  { id: "lead", label: "Lead" },
  { id: "token", label: "Token Paid" },
  { id: "agreement", label: "Agreement" },
  { id: "completed", label: "Completed" },
];

const stages = [
  { id: "lead", label: "Lead", count: 5, dot: "bg-primary", bg: "bg-blue-50" },
  { id: "token", label: "Token Paid", count: 2, dot: "bg-accent", bg: "bg-emerald-50" },
  { id: "agreement", label: "Agreement", count: 1, dot: "bg-orange-400", bg: "bg-orange-50" },
  { id: "completed", label: "Completed", count: 12, dot: "bg-gray-400", bg: "bg-white border border-gray-200" },
];

const views = [
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
  { id: "table", label: "Table", icon: TableIcon },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

export default function BrokerDeals() {
  const [active, setActive] = useState("all");
  const [view, setView] = useState("kanban");

  return (
    <BrokerLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Deals <span className="text-gray-900">(20)</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg border border-gray-200 bg-white">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = view === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`inline-flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={14} /> {v.label}
                </button>
              );
            })}
          </div>
          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
            <Plus size={16} /> Create Deal
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {stages.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg ${s.bg}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-sm font-medium text-gray-700">{s.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">{s.count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-4">
          <Briefcase size={28} />
        </div>
        <p className="text-gray-500 font-medium mb-1">No deals yet</p>
        <p className="text-sm text-gray-400">
          Your deals will appear here once you start engaging with tenants
        </p>
      </div>
    </BrokerLayout>
  );
}
