import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  User,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Building2,
  Users as UsersIcon,
  Utensils,
} from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { getTenants, timeAgo, type Tenant } from "@/lib/tenants";

function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

function formatDate(d?: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function TenantCard({ t }: { t: Tenant }) {
  const [open, setOpen] = useState(false);

  const summaryChips: { icon: React.ReactNode; label: string }[] = [];
  if (t.who) summaryChips.push({ icon: <UsersIcon size={12} />, label: t.who });
  if (t.food) summaryChips.push({ icon: <Utensils size={12} />, label: t.food });
  if (t.occupancyFrom)
    summaryChips.push({
      icon: <Calendar size={12} />,
      label: `From ${formatDate(t.occupancyFrom)}`,
    });
  if (t.localities?.length)
    summaryChips.push({
      icon: <MapPin size={12} />,
      label: `${t.city ?? ""} · ${t.localities.slice(0, 2).join(", ")}${
        t.localities.length > 2 ? ` +${t.localities.length - 2}` : ""
      }`,
    });
  if (t.propertyType)
    summaryChips.push({ icon: <Building2 size={12} />, label: t.propertyType });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
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
        <div className="flex items-center gap-2 flex-wrap">
          {t.detailsComplete ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Profile Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Onboarding Pending
            </span>
          )}
        </div>
      </div>

      {summaryChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 ml-14">
          {summaryChips.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs"
            >
              {c.icon} {c.label}
            </span>
          ))}
        </div>
      )}

      {open && t.detailsComplete && (
        <div className="mt-4 ml-14 rounded-lg border border-gray-100 bg-gray-50/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <DetailRow label="Occupancy from" value={formatDate(t.occupancyFrom)} />
          <DetailRow label="Staying as" value={t.who ?? "—"} />
          {t.identify && t.identify.length > 0 && (
            <DetailRow label="Identifies as" value={t.identify.join(", ")} />
          )}
          <DetailRow label="Food preference" value={t.food ?? "—"} />
          <DetailRow label="City" value={t.city ?? "—"} />
          <DetailRow
            label="Localities"
            value={t.localities?.join(", ") ?? "—"}
          />
          <DetailRow label="Property type" value={t.propertyType ?? "—"} />
          <DetailRow label="Sharing" value={t.sharing ?? "—"} />
          {t.roommate && t.roommate.length > 0 && (
            <DetailRow
              label="Roommate preference"
              value={t.roommate.join(", ")}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 flex-wrap gap-3">
        <p className="text-xs text-gray-500">Added {timeAgo(t.createdAt)}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {t.detailsComplete && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {open ? (
                <>
                  Hide details <ChevronUp size={14} />
                </>
              ) : (
                <>
                  View details <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
          <button className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Phone size={14} /> Call
          </button>
          <button className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <MessageCircle size={14} /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
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
    invitation: tenants.filter((t) => t.invitationSent).length,
  };

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "new", label: "New", count: counts.new },
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
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
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
              className={`h-8 px-4 rounded-lg text-xs font-medium transition-colors ${
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
            <TenantCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
