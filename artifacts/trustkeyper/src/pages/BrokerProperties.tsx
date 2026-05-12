import React, { useState, useEffect } from "react";
import { Plus, Building2, Eye, Heart, Phone } from "lucide-react";
import { useLocation } from "wouter";
import BrokerLayout from "@/components/BrokerLayout";
import { Input } from "@/components/ui/input";
import {
  getProperties,
  updatePropertyStatus,
  updateProperty,
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
  onUpdate,
}: {
  property: Property;
  onMarkRented: (id: string) => void;
  onViewDetails: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Property, "id" | "createdAt" | "uploadedBy">>) => void;
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

  const [editing, setEditing] = useState(false);
  const [draftNickname, setDraftNickname] = useState(property.nickname ?? "");
  const [draftArea, setDraftArea] = useState(property.area);
  const [draftCity, setDraftCity] = useState(property.city);
  const [draftMonthlyRent, setDraftMonthlyRent] = useState(property.monthlyRent);
  const [draftAvailableFrom, setDraftAvailableFrom] = useState(property.availableFrom);
  const [draftTotalFloors, setDraftTotalFloors] = useState(property.totalFloors);
  const [draftFloorLevel, setDraftFloorLevel] = useState(property.floorLevel);

  React.useEffect(() => {
    if (!editing) {
      setDraftNickname(property.nickname ?? "");
      setDraftArea(property.area);
      setDraftCity(property.city);
      setDraftMonthlyRent(property.monthlyRent);
      setDraftAvailableFrom(property.availableFrom);
      setDraftTotalFloors(property.totalFloors);
      setDraftFloorLevel(property.floorLevel);
    }
  }, [editing, property]);

  const handleSave = () => {
    onUpdate(property.id, {
      nickname: draftNickname,
      area: draftArea,
      city: draftCity,
      monthlyRent: draftMonthlyRent,
      availableFrom: draftAvailableFrom,
      totalFloors: draftTotalFloors,
      floorLevel: draftFloorLevel,
    });
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="w-full sm:w-36 aspect-[4/3] bg-gray-100 relative flex items-center justify-center overflow-hidden">
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

        <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
                             <p className="font-semibold text-gray-900 leading-tight truncate" title={title}>{title}</p>
               <p className="text-xs text-gray-500 mt-0.5 truncate" title={subtitle}>{subtitle}</p>
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

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye size={12} /> 0 views</span>
            <span className="flex items-center gap-1"><Heart size={12} /> 0 shortlists</span>
            <span className="flex items-center gap-1"><Phone size={12} /> 0 contacts</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="h-9 sm:h-8 px-4 sm:px-3 rounded border border-primary text-sm sm:text-xs font-medium text-primary hover:bg-primary/5"
            >
              {editing ? "Cancel Edit" : "Edit Property"}
            </button>
          <button
            type="button"
            onClick={() => onViewDetails(property.id)}
            className="h-9 sm:h-8 px-4 sm:px-3 rounded border border-gray-300 text-sm sm:text-xs font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
          >
            View Details
          </button>
            {property.status !== "Rented" && (
              <button
                type="button"
                onClick={() => onMarkRented(property.id)}
                className="h-9 sm:h-8 px-4 sm:px-3 rounded border border-primary text-sm sm:text-xs font-medium text-primary hover:bg-primary/5"
              >
                Mark as Rented
              </button>
            )}
          </div>

          {editing && (
            <div className="border border-gray-200 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Edit property details</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                  <Input
                    value={draftNickname}
                    onChange={(e) => setDraftNickname(e.target.value)}
                    placeholder="My property 01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area / Landmark</label>
                  <Input
                    value={draftArea}
                    onChange={(e) => setDraftArea(e.target.value)}
                    placeholder="Area or landmark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    value={draftCity}
                    onChange={(e) => setDraftCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                  <Input
                    value={draftTotalFloors}
                    onChange={(e) => setDraftTotalFloors(e.target.value)}
                    placeholder="e.g. 10"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Level</label>
                  <Input
                    value={draftFloorLevel}
                    onChange={(e) => setDraftFloorLevel(e.target.value)}
                    placeholder="e.g. 3rd"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Monthly Rent</label>
                  <Input
                    type="number"
                    value={draftMonthlyRent}
                    onChange={(e) => setDraftMonthlyRent(e.target.value)}
                    placeholder="Rent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                  <Input
                    type="date"
                    value={draftAvailableFrom}
                    onChange={(e) => setDraftAvailableFrom(e.target.value)}
                    className="appearance-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="h-9 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
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
  const handleUpdate = (id: string, updates: Partial<Omit<Property, "id" | "createdAt" | "uploadedBy">>) => {
    updateProperty(id, updates);
    refresh();
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">
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
            <PropertyCard
              key={p.id}
              property={p}
              onMarkRented={handleMarkRented}
              onViewDetails={handleViewDetails}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
