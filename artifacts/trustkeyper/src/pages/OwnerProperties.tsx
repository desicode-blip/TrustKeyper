import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Building2, ChevronLeft } from "lucide-react";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { OwnerPropertyCard } from "@/components/owner/OwnerPropertyCard";
import { Button } from "@/components/ui/button";
import { getProperties, type Property } from "@/lib/properties";

const TABS = [
  { id: "all", label: "All" },
  { id: "Occupied", label: "Occupied" },
  { id: "Vacant", label: "Vacant" },
];

export default function OwnerProperties() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName();
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const all = getProperties();
    const ownerProps = all.filter(p => p.uploadedBy === "owner" || p.ownerName === ownerName);
    setProperties(ownerProps);
  }, [ownerName]);

  const counts = {
    all: properties.length,
    Occupied: properties.filter((p) => p.status === "Rented").length,
    Vacant: properties.filter((p) => p.status !== "Rented").length,
  };

  const visible = properties.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "Occupied") return p.status === "Rented";
    if (activeTab === "Vacant") return p.status !== "Rented";
    return true;
  });

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline w-fit">
            <ChevronLeft size={20} /> Back
          </button>
          <Button
            onClick={() => setLocation("/owner/properties/add")}
            className="rounded-xl border-0 font-semibold shadow-lg shadow-primary/25 h-10 px-6 w-fit"
          >
            Add Property <Plus size={18} />
          </Button>
        </div>
        <div
          className="flex items-stretch gap-1 mb-8 w-full max-w-full rounded-lg border border-gray-200 bg-white p-1"
          role="tablist"
        >
          {TABS.map((t) => {
            const count = counts[t.id as keyof typeof counts];
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.id)}
                className={`min-h-9 flex-1 min-w-0 rounded-md px-1 sm:px-2 py-2 text-xs sm:text-sm font-medium text-center leading-tight transition-colors ${
                  isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-lg border border-dashed border-gray-300">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-4 bg-gray-50">
                <Building2 size={24} />
              </div>
              <p className="text-gray-600 font-medium mb-1">No properties in this category</p>
              {activeTab === "all" && (
                <button onClick={() => setLocation("/owner/properties/add")} className="text-primary text-sm font-medium hover:underline mt-2">
                  Add a property
                </button>
              )}
            </div>
          ) : (
            visible.map((property) => (
              <OwnerPropertyCard
                key={property.id}
                property={property}
                onClick={() => setLocation(`/owner/properties/${property.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
