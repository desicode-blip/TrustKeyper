import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, MoreVertical, Send, Users, Utensils } from "lucide-react";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { InviteTenantsModal } from "@/components/owner/InviteTenantsModal";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProperties, type Property } from "@/lib/properties";
import {
  formatMemberContact,
  getInviteStatusCounts,
  getOwnerInvites,
  INVITE_STATUS_LABELS,
  isInviteFromInquiry,
  normalizeInviteStatus,
  openWhatsAppInvite,
  OWNER_INVITES_UPDATED_EVENT,
  updateOwnerInviteStatus,
  type InviteStatus,
  type OwnerTenantInvite,
} from "@/lib/ownerTenants";

const TABS = [
  { id: "invites", label: "Invites" },
  { id: "active", label: "Active Tenants" },
] as const;

const INVITE_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
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
  rejected: "bg-gray-500",
};

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-white text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}
    >
      {INVITE_STATUS_LABELS[status]}
    </span>
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

function InvitedTenantRow({
  invite,
  onUpdate,
}: {
  invite: OwnerTenantInvite;
  onUpdate: () => void;
}) {
  const fromInquiry = isInviteFromInquiry(invite);
  const status = normalizeInviteStatus(invite.status);

  const handleStatusChange = (next: InviteStatus) => {
    updateOwnerInviteStatus(invite.id, next);
    onUpdate();
  };

  return (
    <div className="rounded-lg bg-[#F3FBF6] border border-green-100/80 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
              <InviteStatusBadge status={status} />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shrink-0 self-end sm:self-start"
              aria-label="Invitation actions"
            >
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              disabled={status === "accepted"}
              onClick={() => handleStatusChange("accepted")}
            >
              Mark as Accepted
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={status === "rejected"}
              onClick={() => handleStatusChange("rejected")}
            >
              Mark as Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <OwnerFlowButton
          type="button"
          flowVariant="outline"
          className="gap-2"
          onClick={() => openWhatsAppInvite(invite)}
        >
          <FaWhatsapp className="w-4 h-4 text-[#25D366]" aria-hidden />
          Send via WhatsApp
        </OwnerFlowButton>
      </div>
    </div>
  );
}

function PropertyInvitesCard({
  propertyLabel,
  invites,
  onUpdate,
}: {
  propertyLabel: string;
  invites: OwnerTenantInvite[];
  onUpdate: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5">
      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-3">
        {propertyLabel}
      </h3>
      <div className="flex flex-col gap-3">
        {invites.map((inv) => (
          <InvitedTenantRow key={inv.id} invite={inv} onUpdate={onUpdate} />
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

  const reload = useCallback(() => {
    setInvites(getOwnerInvites());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const refresh = () => reload();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener(OWNER_INVITES_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(OWNER_INVITES_UPDATED_EVENT, refresh);
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

  const statusCounts = useMemo(() => getInviteStatusCounts(invites), [invites]);

  const tabLabel = (id: TenantTab) => {
    if (id === "invites") return `Invites (${invites.length})`;
    return `Active Tenants (${statusCounts.accepted})`;
  };

  const filterLabel = (id: InviteFilter) => {
    if (id === "all") return `All (${invites.length})`;
    if (id === "pending") return `Pending (${statusCounts.pending})`;
    if (id === "accepted") return `Accepted (${statusCounts.accepted})`;
    if (id === "rejected") return `Rejected (${statusCounts.rejected})`;
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
                    <PropertyInvitesCard
                      key={label}
                      propertyLabel={label}
                      invites={group}
                      onUpdate={reload}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <OwnerPageEmpty
                icon={Users}
                title={invites.length === 0 ? "No invites yet" : "No invites in this filter"}
                description={
                  invites.length === 0
                    ? "Create an invitation, then send it manually via WhatsApp."
                    : "Try another filter or create a new invitation."
                }
              />
            )}
          </div>
        )}

        {activeTab === "active" && (
          <OwnerPageEmpty
            icon={Users}
            title={statusCounts.accepted === 0 ? "No active tenants" : "Active tenants"}
            description={
              statusCounts.accepted === 0
                ? "Mark invitations as Accepted after the tenant replies on WhatsApp."
                : `${statusCounts.accepted} tenant${statusCounts.accepted === 1 ? "" : "s"} accepted your invitation.`
            }
          />
        )}
      </div>

      <InviteTenantsModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        properties={ownerProperties}
        onSuccess={reload}
      />
    </OwnerLayout>
  );
}
