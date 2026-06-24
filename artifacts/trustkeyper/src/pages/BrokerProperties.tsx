import React, { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import BrokerLayout from "@/components/BrokerLayout";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { PropertyListingCard } from "@/components/property/PropertyListingCard";
import {
  getProperties,
  updatePropertyStatus,
  type Property,
  type PropertyStatus,
} from "@/lib/properties";
import { PROPERTIES_UPDATED_EVENT } from "@/lib/propertyEditValidation";

const TAB_IDS: { id: "all" | PropertyStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "Draft", label: "Draft" },
  { id: "Rented", label: "Rented" },
];

export default function BrokerProperties() {
  const [, setLocation] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [active, setActive] = useState<"all" | PropertyStatus>("all");

  const refresh = () => setProperties(getProperties());

  const handleViewDetails = (id: string) => setLocation(`/broker/properties/${id}`);
  const handleEditProperty = (id: string) => setLocation(`/broker/properties/${id}?edit=true`);

  useEffect(() => {
    refresh();
    window.addEventListener(PROPERTIES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROPERTIES_UPDATED_EVENT, refresh);
  }, []);

  const handleMarkRented = (id: string) => {
    updatePropertyStatus(id, "Rented");
    refresh();
  };

  const counts = {
    all: properties.length,
    Active: properties.filter((p) => p.status === "Active").length,
    Draft: properties.filter((p) => p.status === "Draft").length,
    Rented: properties.filter((p) => p.status === "Rented").length,
  };

  const visible = properties.filter((p) => {
    if (active === "all") return true;
    return p.status === active;
  });

  return (
    <BrokerLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          My Properties ({counts.all})
        </h1>
        <BrokerFlowButton onClick={() => setLocation("/broker/properties/add")} className="w-full sm:w-fit">
          <Plus size={16} /> Add Property
        </BrokerFlowButton>
      </div>

      <FlowSegmentTabs
        value={active}
        onChange={(v) => setActive(v)}
        className="mb-8"
        options={TAB_IDS.map((t) => ({
          value: t.id,
          label: `${t.label} (${counts[t.id]})`,
        }))}
      />

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-4">
            <Building2 size={28} />
          </div>
          <p className="text-gray-500 font-medium mb-1">No Properties Found</p>
          <p className="text-sm text-gray-400">
            Add your first property to get started with TrustKeyper
          </p>
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 auto-rows-fr">
          {visible.map((p) => (
            <PropertyListingCard
              key={p.id}
              property={p}
              variant="broker"
              onOpen={() => handleViewDetails(p.id)}
              onEdit={() => handleEditProperty(p.id)}
              onMarkRented={() => handleMarkRented(p.id)}
            />
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
