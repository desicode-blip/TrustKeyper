import React, { useState, useEffect } from "react";
import { Plus, Building2, Eye, Heart, Phone } from "lucide-react";
import { useLocation } from "wouter";
import BrokerLayout from "@/components/BrokerLayout";
import {
  getProperties,
  updatePropertyStatus,
  getPropertyTitle,
  type Property,
  type PropertyStatus,
} from "@/lib/properties";
import { timeAgo } from "@/lib/tenants";

const TAB_IDS: { id: "all" | PropertyStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "Draft", label: "Draft" },
  { id: "Rented", label: "Rented" },
];

function StatusBadge({ status }: { status: PropertyStatus }) {
  const styles: Record<PropertyStatus, string> = {
    Active: "text-green-600 bg-green-50",
    Draft: "text-gray-500 bg-gray-100",
    Rented: "text-blue-600 bg-blue-50",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status === "Active" && <span className="text-green-500">✓</span>}
      {status}
    </span>
  );
}

function PropertyCard({
  property,
  onMarkRented,
  onViewDetails,
}: {
  property: Property;
  onMarkRented: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const type = property.propertyType === "Other"
    ? (property.propertyTypeOther || "Property")
    : property.propertyType;
  const size = property.unitSize === "Other"
    ? (property.unitSizeOther || "")
    : property.unitSize;
  const title = getPropertyTitle(property);
  const subtitle = `${property.area}, ${property.city}`;
  const rent = property.monthlyRent
    ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}/month`
    : "—";
  const deposit = property.securityDeposit
    ? `₹${Number(property.securityDeposit).toLocaleString("en-IN")} deposit`
    : "";
  const area = property.builtUpArea
    ? `${property.builtUpArea} ${property.builtUpUnits}`
    : "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex overflow-hidden">
      {/* Thumbnail */}
      <div className="w-36 shrink-0 bg-gray-100 relative flex items-center justify-center overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt="property"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Building2 size={32} className="text-gray-400" />
        )}
        {property.imageCount > 0 && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            {property.imageCount} pics
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>

        <p className="text-sm text-gray-700">
          {[rent, deposit].filter(Boolean).join(" • ")}
        </p>

        <p className="text-xs text-gray-500">
          {[area, property.furnishing, `Listed ${timeAgo(property.createdAt)}`]
            .filter(Boolean)
            .join(" • ")}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye size={12} /> 0 views</span>
          <span className="flex items-center gap-1"><Heart size={12} /> 0 shortlists</span>
          <span className="flex items-center gap-1"><Phone size={12} /> 0 contacts</span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onViewDetails(property.id)}
            className="h-7 px-3 rounded border border-primary text-xs font-medium text-primary hover:bg-primary/5"
          >
            View Details
          </button>
          <button className="h-7 px-3 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50">
            Edit
          </button>
          {property.status !== "Rented" && (
            <button
              onClick={() => onMarkRented(property.id)}
              className="h-7 px-3 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Mark as Rented
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrokerProperties() {
  const [, setLocation] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [active, setActive] = useState<"all" | PropertyStatus>("all");

  const refresh = () => setProperties(getProperties());

  const handleViewDetails = (id: string) => setLocation(`/broker/properties/${id}`);

  useEffect(() => {
    refresh();
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
        <h1 className="text-2xl font-bold text-gray-900">
          My Properties ({counts.all})
        </h1>
        <button
          onClick={() => setLocation("/broker/properties/add")}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {TAB_IDS.map((t) => {
          const count = counts[t.id];
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`h-8 px-4 rounded-lg text-xs font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

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
        <div className="flex flex-col gap-4">
          {visible.map((p) => (
            <PropertyCard key={p.id} property={p} onMarkRented={handleMarkRented} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
