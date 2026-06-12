import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Building2, MapPin, BedDouble, Bath, Calendar, IndianRupee } from "lucide-react";
import { TrustKeyperLogo } from "@/components/brand";
import { getProperties, getPropertyTitle, type Property } from "@/lib/properties";

function formatRent(v?: string): string {
  if (!v) return "—";
  return `₹${Number(v).toLocaleString("en-IN")}/mo`;
}

export default function SharedProperty() {
  const [, params] = useRoute("/share/property/:id");
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    const found = getProperties().find((p) => p.id === params.id) ?? null;
    setProperty(found);
  }, [params?.id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
        <Building2 size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">Property not found</p>
        <p className="text-sm text-gray-400 mt-1">This link may be outdated or invalid.</p>
      </div>
    );
  }

  const title = getPropertyTitle(property);
  const images = property.images ?? [];
  const type =
    property.propertyType === "Other"
      ? property.propertyTypeOther || "Property"
      : property.propertyType;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4">
        <TrustKeyperLogo variant="brand" size="header" />
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-5">
        <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">
          {images[0] ? (
            <img src={images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Building2 size={48} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {[property.area, property.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <IndianRupee size={12} /> Rent
              </p>
              <p className="font-semibold text-gray-900">{formatRent(property.monthlyRent)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-semibold text-gray-900">{type || "—"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <BedDouble size={12} /> Beds
              </p>
              <p className="font-semibold text-gray-900">{property.bedrooms || property.unitSize || "—"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Available
              </p>
              <p className="font-semibold text-gray-900">
                {property.availableFrom
                  ? new Date(property.availableFrom).toLocaleDateString("en-IN")
                  : "Immediately"}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Furnishing</dt>
              <dd className="font-medium text-gray-900">{property.furnishing || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Built-up area</dt>
              <dd className="font-medium text-gray-900">
                {property.builtUpArea
                  ? `${property.builtUpArea} ${property.builtUpUnits || ""}`.trim()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Deposit</dt>
              <dd className="font-medium text-gray-900">
                {property.securityDeposit
                  ? `₹${Number(property.securityDeposit).toLocaleString("en-IN")}`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-start gap-1">
              <Bath size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-gray-500">Bathrooms</dt>
                <dd className="font-medium text-gray-900">{property.bathrooms || "—"}</dd>
              </div>
            </div>
          </dl>

          {property.address ? (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm text-gray-700">{property.address}</p>
            </div>
          ) : null}
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">Shared via TrustKeyper</p>
      </main>
    </div>
  );
}
