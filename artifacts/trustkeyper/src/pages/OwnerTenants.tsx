import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Send, Users, Utensils } from "lucide-react";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { InviteTenantsModal } from "@/components/owner/InviteTenantsModal";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";
import { getOwnerProfile } from "@/lib/ownerProfile";
import { getProperties, type Property } from "@/lib/properties";
import {
  formatMemberContact,
  getOwnerInvites,
  INVITE_STATUS_LABELS,
  isInviteFromInquiry,
  normalizeInviteStatus,
  refreshOwnerInvitesFromApi,
  whatsAppHref,
  type InviteStatus,
  type OwnerTenantInvite,
} from "@/lib/ownerTenants";
import {
  invitePublicUrl,
  whatsAppInviteHref,
  whatsAppInviteMessage,
} from "@/lib/tenantInvitationsApi";

const TABS = [
  { id: "invites", label: "Invites" },
  { id: "active", label: "Active Tenants" },
] as const;

const INVITE_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
] as const;

type TenantTab = (typeof TABS)[number]["id"];
type InviteFilter = (typeof INVITE_FILTERS)[number]["id"];

function filterOwnerProperties(all: Property[], ownerName: string): Property[] {
  const name = ownerName.replace("!", "").trim();
  return all.filter((p) => p.uploadedBy === "owner" || p.ownerName === name);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

const STATUS_BADGE_CLASS: Record<InviteStatus, string> = {
  pending: "bg-[#768EA7]",
  accepted: "bg-green-600",
  declined: "bg-gray-500",
  expired: "bg-amber-600",
};

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-full text-white text-xs font-medium leading-snug text-center max-w-[240px] sm:max-w-none ${STATUS_BADGE_CLASS[status]}`}
    >
      {INVITE_STATUS_LABELS[status]}
    </span>
  );
}

function WhatsAppIconButton({ phone, invite }: { phone: string; invite: OwnerTenantInvite }) {
  const href = useMemo(() => {
    if (invite.token && invite.status === "pending") {
      const profile = getOwnerProfile();
      const url = invite.inviteUrl ?? invitePublicUrl(invite.token);
      const message = whatsAppInviteMessage({
        tenantName: invite.name,
        ownerName: profile.name || "Property owner",
        propertyLabel: invite.propertyLabel,
        inviteUrl: url,
      });
      return whatsAppInviteHref(phone, message);
    }
    return whatsAppHref(phone);
  }, [phone, invite]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#20bd5a] transition-colors shrink-0"
    >
      <FaWhatsapp className="w-5 h-5" aria-hidden />
    </a>
  );
}

function LinkedInProfileLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary border border-primary/40 bg-white px-2.5 py-0.5 rounded-full hover:bg-primary/5 transition-colors shrink-0"
    >
      <FaLinkedin className="w-3 h-3 shrink-0 text-primary" aria-hidden />
      View profile
    </a>
  );
}

function InvitedTenantRow({ invite }: { invite: OwnerTenantInvite }) {
  const fromInquiry = isInviteFromInquiry(invite);
  const status = normalizeInviteStatus(invite.status);

  return (
    <div className="rounded-lg bg-[#F3FBF6] border border-green-100/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-semibold shrink-0">
          {getInitials(invite.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-gray-900 text-[15px]">{invite.name}</p>
            {fromInquiry && invite.linkedinUrl ? (
              <LinkedInProfileLink url={invite.linkedinUrl} />
            ) : null}
          </div>
          {fromInquiry ? (
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span>For {invite.propertyLabel}</span>
              {invite.who ? (
                <span className="inline-flex items-center gap-1">
                  <Users size={12} className="opacity-70 shrink-0" />
                  {invite.who}
                </span>
              ) : null}
              {invite.food ? (
                <span className="inline-flex items-center gap-1">
                  <Utensils size={12} className="opacity-70 shrink-0" />
                  {invite.food}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{formatMemberContact(invite.phone)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end shrink-0">
        <InviteStatusBadge status={status} />
        <WhatsAppIconButton phone={invite.phone} invite={invite} />
      </div>
    </div>
  );
}

function PropertyInvitesCard({
  propertyLabel,
  invites,
}: {
  propertyLabel: string;
  invites: OwnerTenantInvite[];
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5">
      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-3">
        {propertyLabel}
      </h3>
      <div className="flex flex-col gap-3">
        {invites.map((inv) => (
          <InvitedTenantRow key={inv.id} invite={inv} />
        ))}
      </div>
    </div>
  );
}

export default function OwnerTenants() {
  const ownerName = getOwnerName();
  const [activeTab, setActiveTab] = useState<TenantTab>("invites");
  const [inviteFilter, setInviteFilter] = useState<InviteFilter>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState<OwnerTenantInvite[]>([]);

  const ownerProperties = useMemo(() => {
    return filterOwnerProperties(getProperties(), ownerName);
  }, [ownerName]);

  const reload = useCallback(async () => {
    const phone = getOwnerProfile().phone.replace(/\D/g, "").slice(-10);
    if (phone.length === 10) {
      const list = await refreshOwnerInvitesFromApi(phone);
      setInvites(list);
      return;
    }
    setInvites(getOwnerInvites());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const refresh = () => void reload();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [reload]);

  const filteredInvites = useMemo(() => {
    if (inviteFilter === "all") return invites;
    return invites.filter((inv) => normalizeInviteStatus(inv.status) === inviteFilter);
  }, [invites, inviteFilter]);

  const invitesByProperty = useMemo(() => {
    const map = new Map<string, OwnerTenantInvite[]>();
    for (const inv of filteredInvites) {
      const list = map.get(inv.propertyLabel) ?? [];
      list.push(inv);
      map.set(inv.propertyLabel, list);
    }
    return map;
  }, [filteredInvites]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, accepted: 0, declined: 0 };
    for (const inv of invites) {
      const s = normalizeInviteStatus(inv.status);
      if (s in counts) counts[s as keyof typeof counts] += 1;
    }
    return counts;
  }, [invites]);

  const tabLabel = (id: TenantTab) => {
    if (id === "invites") return `Invites (${invites.length})`;
    const accepted = statusCounts.accepted;
    return `Active Tenants (${accepted})`;
  };

  const filterLabel = (id: InviteFilter) => {
    if (id === "all") return `All (${invites.length})`;
    if (id === "pending") return `Pending (${statusCounts.pending})`;
    if (id === "accepted") return `Accepted (${statusCounts.accepted})`;
    if (id === "declined") return `Declined (${statusCounts.declined})`;
    return id;
  };

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline w-fit"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <OwnerFlowButton onClick={() => setInviteOpen(true)}>
            <Send size={16} />
            Invite Tenants
          </OwnerFlowButton>
        </div>

        <FlowSegmentTabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as TenantTab)}
          className="mb-6"
          options={TABS.map((t) => ({ value: t.id, label: tabLabel(t.id) }))}
        />

        {activeTab === "invites" && (
          <div className="space-y-6">
            <FlowSegmentTabs
              value={inviteFilter}
              onChange={(value) => setInviteFilter(value as InviteFilter)}
              className="mb-2 max-w-2xl"
              options={INVITE_FILTERS.map((f) => ({
                value: f.id,
                label: filterLabel(f.id),
              }))}
            />

            {filteredInvites.length > 0 ? (
              <section>
                <div className="flex flex-col gap-4">
                  {Array.from(invitesByProperty.entries()).map(([label, group]) => (
                    <PropertyInvitesCard key={label} propertyLabel={label} invites={group} />
                  ))}
                </div>
              </section>
            ) : (
              <OwnerPageEmpty
                icon={Users}
                title={invites.length === 0 ? "No invites yet" : "No invites in this filter"}
                description={
                  invites.length === 0
                    ? "Invited tenants will appear here once you send an invitation."
                    : "Try another filter or send a new invitation."
                }
              />
            )}
          </div>
        )}

        {activeTab === "active" && (
          <OwnerPageEmpty
            icon={Users}
            title="No active tenants"
            description="Tenants who accept your invitation will appear here once you start lease onboarding."
          />
        )}
      </div>

      <InviteTenantsModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        properties={ownerProperties}
        onSuccess={() => void reload()}
      />
    </OwnerLayout>
  );
}
