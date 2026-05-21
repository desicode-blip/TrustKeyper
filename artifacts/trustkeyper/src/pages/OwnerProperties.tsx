import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, MapPin, Building2, ChevronLeft } from "lucide-react";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
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
        <div className="flex items-center gap-3 mb-8">
          {TABS.map((t) => {
            const count = counts[t.id as keyof typeof counts];
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`h-9 px-4 rounded-md text-sm font-medium transition-colors border ${
                  isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
              <div 
                key={property.id} 
                onClick={() => setLocation(`/owner/properties/${property.id}`)}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-gray-100">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt="Property" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                    {property.status !== "Rented" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />} 
                    {property.status === "Rented" ? "Occupied" : "Live"}
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg sm:text-base">{property.nickname || property.address || "Property Name"}</h3>
                    <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 shrink-0">
                      <span className="text-[10px]">›</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin size={12} /> {property.area}, {property.city}
                  </p>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-base sm:text-[15px]">
                        ₹{Number(property.monthlyRent || 0).toLocaleString("en-IN")}<span className="text-xs text-gray-500 font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
