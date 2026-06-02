import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Send, Users, Utensils } from "lucide-react";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { InviteTenantsModal } from "@/components/owner/InviteTenantsModal";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { Button } from "@/components/ui/button";
import { getProperties, type Property } from "@/lib/properties";
import {
  formatMemberContact,
  getOwnerInquiries,
  getOwnerInvites,
  isInviteFromInquiry,
  removeLegacySeedInquiries,
  whatsAppHref,
  type OwnerTenantInquiry,
  type OwnerTenantInvite,
} from "@/lib/ownerTenants";

const TABS = [
  { id: "inquiries", label: "Inquiries" },
  { id: "active", label: "Active Tenants" },
  { id: "past", label: "Past Tenants" },
] as const;

type TenantTab = (typeof TABS)[number]["id"];

const INVITE_STATUS_LABEL = "Confirmation sent. Waiting for tenant to accept.";

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

function WhatsAppIconButton({ phone }: { phone: string }) {
  return (
    <a
      href={whatsAppHref(phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#20bd5a] transition-colors shrink-0"
    >
      <FaWhatsapp className="w-5 h-5" aria-hidden />
    </a>
  );
}

function InviteStatusBadge() {
  return (
    <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#768EA7] text-white text-xs font-medium leading-snug text-center max-w-[240px] sm:max-w-none">
      {INVITE_STATUS_LABEL}
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

function InvitedTenantRow({ invite }: { invite: OwnerTenantInvite }) {
  const fromInquiry = isInviteFromInquiry(invite);

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
        <InviteStatusBadge />
        <WhatsAppIconButton phone={invite.phone} />
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

function InquiryCard({ inquiry }: { inquiry: OwnerTenantInquiry }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold shrink-0">
          {getInitials(inquiry.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
            {inquiry.linkedinUrl ? <LinkedInProfileLink url={inquiry.linkedinUrl} /> : null}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span>For {inquiry.propertyLabel}</span>
            {inquiry.who ? (
              <span className="inline-flex items-center gap-1">
                <Users size={12} className="opacity-70 shrink-0" />
                {inquiry.who}
              </span>
            ) : null}
            {inquiry.food ? (
              <span className="inline-flex items-center gap-1">
                <Utensils size={12} className="opacity-70 shrink-0" />
                {inquiry.food}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:justify-end w-full sm:w-auto">
        <WhatsAppIconButton phone={inquiry.phone} />
      </div>
    </div>
  );
}

export default function OwnerTenants() {
  const ownerName = getOwnerName();
  const [activeTab, setActiveTab] = useState<TenantTab>("inquiries");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inquiries, setInquiries] = useState<OwnerTenantInquiry[]>([]);
  const [invites, setInvites] = useState<OwnerTenantInvite[]>([]);

  const ownerProperties = useMemo(() => {
    return filterOwnerProperties(getProperties(), ownerName);
  }, [ownerName]);

  const reload = useCallback(() => {
    removeLegacySeedInquiries();
    setInquiries(getOwnerInquiries());
    setInvites(getOwnerInvites());
  }, []);

  useEffect(() => {
    removeLegacySeedInquiries();
    reload();
  }, [reload]);

  const openInquiries = inquiries.filter((i) => i.status === "open");
  const inquiryCount = openInquiries.length;

  const invitesByProperty = useMemo(() => {
    const map = new Map<string, OwnerTenantInvite[]>();
    for (const inv of invites) {
      const list = map.get(inv.propertyLabel) ?? [];
      list.push(inv);
      map.set(inv.propertyLabel, list);
    }
    return map;
  }, [invites]);

  const tabLabel = (id: TenantTab) => {
    if (id === "inquiries") return `Inquiries (${inquiryCount})`;
    if (id === "active") return "Active Tenants (0)";
    return "Past Tenants";
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
          <Button
            onClick={() => setInviteOpen(true)}
            className="rounded-xl border-0 font-semibold shadow-md shadow-primary/25 gap-2"
          >
            <Send size={16} />
            Invite Tenants
          </Button>
        </div>

        <FlowSegmentTabs
          value={activeTab}
          onChange={setActiveTab}
          className="mb-8"
          options={TABS.map((t) => ({ value: t.id, label: tabLabel(t.id) }))}
        />

        {activeTab === "inquiries" && (
          <div className="space-y-8">
            {invites.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Invites</h2>
                <div className="flex flex-col gap-4">
                  {Array.from(invitesByProperty.entries()).map(([label, group]) => (
                    <PropertyInvitesCard key={label} propertyLabel={label} invites={group} />
                  ))}
                </div>
              </section>
            )}

            <section>
              {invites.length > 0 && (
                <h2 className="text-base font-semibold text-gray-900 mb-4">Inquiries</h2>
              )}
              {openInquiries.length === 0 ? (
                <OwnerPageEmpty
                  icon={Users}
                  title="No inquiries yet"
                  description="When a tenant logged into Trustkeyper shows interest in your property, their inquiry will appear here."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {openInquiries.map((inq) => (
                    <InquiryCard key={inq.id} inquiry={inq} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "active" && (
          <OwnerPageEmpty
            icon={Users}
            title="No active tenants"
            description="Tenants with an active lease will show up here once they accept your invitation."
          />
        )}

        {activeTab === "past" && (
          <OwnerPageEmpty
            icon={Users}
            title="No past tenants"
            description="Former tenants will be listed here after a lease ends."
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
