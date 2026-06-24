import React from "react";
import {
  Building2,
  MapPin,
  Share2,
  Edit,
  BedDouble,
  IndianRupee,
  Ruler,
  Sofa,
  Users,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import type { Property } from "@/lib/properties";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";

function bhkSummary(property: Property): string {
  const beds = property.bedrooms?.trim();
  if (beds) return `${beds} BHK`;
  if (property.unitSize && property.unitSize !== "Other") return property.unitSize;
  return property.unitSizeOther || "—";
}

function formatDate(value: string): string {
  if (!value) return "Immediately";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export interface PropertyDetailsHeroProps {
  property: Property;
  title: string;
  onShare: () => void;
  onEdit: () => void;
  editLabel?: string;
  showEdit?: boolean;
  showActions?: boolean;
  isRented?: boolean;
  verifiedLabel?: string;
}

export function PropertyDetailsHero({
  property,
  title,
  onShare,
  onEdit,
  editLabel = "Edit Details",
  showEdit = true,
  showActions = true,
  isRented = property.status === "Rented",
  verifiedLabel,
}: PropertyDetailsHeroProps) {
  const location = [property.area, property.city].filter(Boolean).join(", ");
  const rent = property.monthlyRent
    ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}`
    : "—";
  const areaLabel = property.builtUpArea
    ? `${property.builtUpArea} ${property.builtUpUnits || ""}`.trim()
    : "—";
  const type = property.propertyType === "Other"
    ? (property.propertyTypeOther || "Property")
    : property.propertyType;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#E8F4FC] to-[#D4EBE4]">
        {property.images?.[0] ? (
          <>
            <img
              src={property.images[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 size={48} className="text-primary/30" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {!isRented && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {isRented ? "Occupied" : "Live"}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-gray-900 leading-tight mb-1">
              {title}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
              <MapPin size={14} className="shrink-0" />
              {location || "—"}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {[
                { icon: BedDouble, label: "BHK", value: bhkSummary(property) },
                { icon: IndianRupee, label: "Price", value: `${rent}/mo` },
                { icon: Ruler, label: "Area", value: areaLabel },
                { icon: Sofa, label: "Furnishing", value: property.furnishing || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#F5F9FC] border border-[#E8EEF4] px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#768EA7] uppercase tracking-wide mb-0.5">
                    <Icon size={12} />
                    {label}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700 min-w-0">
                <Building2 size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">{type}</span>
              </div>
              {property.tenantsPreferred?.length > 0 ? (
                <div className="flex items-center gap-2 text-gray-700 min-w-0">
                  <Users size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{property.tenantsPreferred[0]}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span>{formatDate(property.availableFrom)}</span>
              </div>
              {verifiedLabel ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{verifiedLabel}</span>
                </div>
              ) : null}
            </div>
          </div>

          {showActions ? (
            <div className="flex flex-col gap-2 w-full lg:w-[220px] shrink-0">
              <OwnerFlowButton type="button" fullWidth onClick={onShare}>
                <Share2 size={16} />
                Share Property
              </OwnerFlowButton>
              {showEdit ? (
                <OwnerFlowButton type="button" fullWidth flowVariant="outline" onClick={onEdit}>
                  <Edit size={16} />
                  {editLabel}
                </OwnerFlowButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
