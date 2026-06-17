import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  MessageCircle,
  Plus,
  User,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Building2,
  Users as UsersIcon,
  Utensils,
  Pencil,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import BrokerLayout from "@/components/BrokerLayout";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { PropertyInquiryRow } from "@/components/property/PropertyInquiryRow";
import { pullAccountFromCloud } from "@/lib/cloudSync";
import {
  BROKER_INQUIRIES_UPDATED_EVENT,
  getBrokerPropertyShareInquiries,
  type OwnerTenantInquiry,
} from "@/lib/ownerTenants";
import { getActiveSession } from "@/lib/storageKeys";
import { getBrokerTenantWhatsAppHref, getTenants, timeAgo, type Tenant } from "@/lib/tenants";

const TABS = [
  { id: "inquiries", label: "Inquiries" },
  { id: "all", label: "All Leads" },
  { id: "new", label: "New" },
] as const;

type BrokerTenantTab = (typeof TABS)[number]["id"];

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

function TenantCard({ t, onEdit }: { t: Tenant; onEdit: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const whatsAppUrl = getBrokerTenantWhatsAppHref(t);

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
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center text-base font-semibold shrink-0">
            {getInitial(t.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{t.name}</p>
              {t.detailsComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Profile Complete
                </span>
              ) : null}
            </div>
            <p className="text-sm text-gray-500">{t.phone}</p>
          </div>
        </div>
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${t.name}`}
          className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 hover:bg-[#20bd5a] transition-colors shadow-sm"
        >
          <FaWhatsapp className="w-5 h-5" aria-hidden />
        </a>
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

      {open && (
        <div className="mt-4 ml-14 rounded-lg border border-gray-100 bg-gray-50/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <DetailRow label="Occupancy from" value={formatDate(t.occupancyFrom)} />
          <DetailRow label="Staying as" value={t.who ?? "—"} />
          {t.identify && t.identify.length > 0 && (
            <DetailRow label="Identifies as" value={t.identify.join(", ")} />
          )}
          <DetailRow label="Food preference" value={t.food ?? "—"} />
          {t.detailsComplete ? (
            <>
              <DetailRow label="City" value={t.city ?? "—"} />
              <DetailRow label="Localities" value={t.localities?.join(", ") ?? "—"} />
              <DetailRow label="Property type" value={t.propertyType ?? "—"} />
              <DetailRow label="Sharing" value={t.sharing ?? "—"} />
              {t.roommate && t.roommate.length > 0 && (
                <DetailRow label="Roommate preference" value={t.roommate.join(", ")} />
              )}
            </>
          ) : (
            <DetailRow label="Preferences" value="L2 details not added yet" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 flex-wrap gap-3">
        <p className="text-xs text-gray-500">Added {timeAgo(t.createdAt)}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <BrokerFlowButton
            type="button"
            flowVariant="sm-ghost"
            onClick={() => setOpen((o) => !o)}
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
          </BrokerFlowButton>
          <BrokerFlowButton
            type="button"
            flowVariant="sm-outline"
            onClick={() => onEdit(t.id)}
          >
            <Pencil size={14} /> Edit details
          </BrokerFlowButton>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

export default function BrokerTenants() {
  const [active, setActive] = useState<BrokerTenantTab>("inquiries");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [inquiries, setInquiries] = useState<OwnerTenantInquiry[]>([]);
  const [, setLocation] = useLocation();

  const reload = useCallback(() => {
    setTenants(getTenants());
    setInquiries(getBrokerPropertyShareInquiries());
  }, []);

  const reloadFromCloud = useCallback(async () => {
    const session = getActiveSession();
    if (session?.role === "broker") {
      await pullAccountFromCloud(session.phone, "broker");
    }
    reload();
  }, [reload]);

  useEffect(() => {
    void reloadFromCloud();
  }, [reloadFromCloud]);

  useEffect(() => {
    const refresh = () => void reloadFromCloud();
    window.addEventListener("focus", refresh);
    window.addEventListener(BROKER_INQUIRIES_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(BROKER_INQUIRIES_UPDATED_EVENT, refresh);
    };
  }, [reloadFromCloud]);

  const counts = {
    all: tenants.length,
    new: tenants.filter((t) => !t.invitationSent).length,
    inquiries: inquiries.length,
  };

  const tabLabel = (id: BrokerTenantTab) => {
    if (id === "inquiries") return `Inquiries (${counts.inquiries})`;
    if (id === "all") return `All Leads (${counts.all})`;
    return `New (${counts.new})`;
  };

  const visibleTenants = tenants.filter((t) => {
    if (active === "all") return true;
    if (active === "new") return !t.invitationSent;
    return false;
  });

  return (
    <BrokerLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tenant Leads</h1>
        <BrokerFlowButton onClick={() => setLocation("/broker/tenants/add")} className="w-full sm:w-fit">
          <Plus size={16} /> Register Tenant Lead
        </BrokerFlowButton>
      </div>

      <FlowSegmentTabs
        value={active}
        onChange={(value) => setActive(value as BrokerTenantTab)}
        className="mb-8"
        options={TABS.map((t) => ({ value: t.id, label: tabLabel(t.id) }))}
      />

      {active === "inquiries" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Property Inquiries</h2>
          <p className="text-sm text-gray-500 -mt-2">
            Tenants who expressed interest via your shared property links.
          </p>
          {inquiries.length > 0 ? (
            <div className="flex flex-col gap-3">
              {inquiries.map((inq) => (
                <PropertyInquiryRow
                  key={inq.id}
                  inquiry={inq}
                  recipientRole="broker"
                  onUpdate={reload}
                />
              ))}
            </div>
          ) : (
            <OwnerPageEmpty
              icon={MessageCircle}
              title="No inquiries yet"
              description="Share a property link via WhatsApp. When tenants express interest, they will appear here."
            />
          )}
        </div>
      )}

      {active !== "inquiries" && (
        <>
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
                <TenantCard
                  key={t.id}
                  t={t}
                  onEdit={(id) => setLocation(`/broker/tenants/add?edit=${id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </BrokerLayout>
  );
}
