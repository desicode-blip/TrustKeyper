import React, { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { Button } from "@/components/ui/button";
import { getProperties, getPropertyTitle, type Property } from "@/lib/properties";

function filterOwnerProperties(all: Property[], ownerName: string): Property[] {
  const name = ownerName.replace("!", "").trim();
  return all.filter((p) => p.uploadedBy === "owner" || p.ownerName === name);
}

function formatLocation(p: Property): string {
  const line = [p.area, p.city].filter(Boolean).join(", ");
  if (line.length <= 36) return line;
  return `${line.slice(0, 34)}....`;
}

function formatActivityTime(createdAt: number): string {
  const d = new Date(createdAt);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName().replace("!", "").trim();
  const displayName = ownerName || "there";
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    setProperties(filterOwnerProperties(getProperties(), ownerName));
  }, [ownerName]);

  const latestProperty = properties[0];

  return (
    <OwnerLayout>
      <div className="p-6 sm:p-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-[28px] font-semibold text-primary tracking-tight">
            Welcome, {displayName}!
          </h1>
          <Button
            size="lg"
            onClick={() => setLocation("/owner/properties/add")}
            className="rounded-xl font-semibold shadow-lg shadow-primary/25 h-11 px-6"
          >
            Add Property <Plus size={18} strokeWidth={2.5} />
          </Button>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-semibold text-gray-900">Your Properties</h2>
            <Link
              href="/owner/properties"
              className="text-[13px] font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {properties.length === 0 ? (
              <button
                type="button"
                onClick={() => setLocation("/owner/properties/add")}
                className="min-h-[320px] rounded-2xl border-2 border-dashed border-primary/25 bg-primary/[0.04] flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary/[0.08] transition-colors"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Plus size={28} strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold">Add your first property</span>
              </button>
            ) : (
              <>
                {properties.slice(0, 2).map((property) => (
                  <article
                    key={property.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setLocation(`/owner/properties/${property.id}`)}
                      className="text-left flex flex-col flex-1"
                    >
                      <div className="relative h-52 bg-gray-100">
                        {property.images?.[0] ? (
                          <img
                            src={property.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-white" />
                          Live
                        </div>
                      </div>
                      <div className="p-5 sm:p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-snug">
                            {property.nickname || getPropertyTitle(property)}
                          </h3>
                          <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 shrink-0">
                            <ArrowRight size={14} />
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5 mb-4">
                          <MapPin size={14} className="text-primary shrink-0" />
                          {formatLocation(property)}
                        </p>
                        <p className="font-semibold text-gray-900 text-xl mt-auto">
                          ₹{Number(property.monthlyRent || 0).toLocaleString("en-IN")}
                          <span className="text-[13px] text-gray-500 font-medium">/mo</span>
                        </p>
                        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                          <Eye size={14} className="text-gray-400" />
                          0 tenants have viewed the property
                        </p>
                      </div>
                    </button>
                  </article>
                ))}

                {properties.length < 2 && (
                  <button
                    type="button"
                    onClick={() => setLocation("/owner/properties/add")}
                    className="min-h-[320px] rounded-2xl border-2 border-dashed border-primary/25 bg-[#F0F4FF] flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                    aria-label="Add property"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-primary/15">
                      <Plus size={26} strokeWidth={2.5} />
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {latestProperty ? (
              <div className="px-6 sm:px-8 py-5 flex items-center gap-5 sm:gap-6 border-b border-gray-50">
                <span className="text-[13px] font-semibold text-gray-400 w-12 shrink-0 tabular-nums">
                  {formatActivityTime(latestProperty.createdAt)}
                </span>
                <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-[15px]">
                    Your property is verified
                  </p>
                  <p className="text-[13px] text-gray-500 font-medium mt-0.5 truncate">
                    {latestProperty.nickname || getPropertyTitle(latestProperty)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-sm text-gray-500">
                Activity will appear here after you add a property.
              </div>
            )}

            <div className="py-4 text-center bg-gray-50/40">
              <button
                type="button"
                onClick={() => setLocation("/owner/dashboard1")}
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                View All Activity
              </button>
            </div>
          </div>
        </section>
      </div>
    </OwnerLayout>
  );
}
