import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, MessageCircle, Send, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { InviteTenantsModal } from "@/components/owner/InviteTenantsModal";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { Button } from "@/components/ui/button";
import { getProperties, type Property } from "@/lib/properties";
import {
  formatMemberContact,
  getOwnerInquiries,
  getOwnerInvites,
  getPropertyInviteLabel,
  initOwnerTenantData,
  type OwnerTenantInquiry,
  type OwnerTenantInvite,
} from "@/lib/ownerTenants";

const TABS = [
  { id: "inquiries", label: "Inquiries" },
  { id: "active", label: "Active Tenants" },
  { id: "past", label: "Past Tenants" },
] as const;

type TenantTab = (typeof TABS)[number]["id"];

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

function InquiryCard({
  inquiry,
  onViewProfile,
}: {
  inquiry: OwnerTenantInquiry;
  onViewProfile: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold shrink-0">
          {getInitials(inquiry.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
            <button
              type="button"
              onClick={onViewProfile}
              className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/15 transition-colors"
            >
              View profile
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <span>For {inquiry.propertyLabel}</span>
            {inquiry.who ? (
              <span className="flex items-center gap-1">
                <Users size={12} className="opacity-60" /> {inquiry.who}
              </span>
            ) : null}
            {inquiry.food ? <span>{inquiry.food}</span> : null}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors w-full sm:w-auto shrink-0"
      >
        <MessageCircle size={16} />
        Chat
      </button>
    </div>
  );
}

function InviteCard({ invite, onViewProfile }: { invite: OwnerTenantInvite; onViewProfile: () => void }) {
  return (
    <div className="bg-green-50/80 rounded-lg border border-green-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-white text-green-700 border border-green-100 flex items-center justify-center text-lg font-semibold shrink-0">
          {getInitials(invite.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900">{invite.name}</h3>
            <button
              type="button"
              onClick={onViewProfile}
              className="flex items-center gap-1 text-[11px] font-medium text-primary bg-white/80 px-2 py-0.5 rounded-full hover:bg-white transition-colors"
            >
              View profile
            </button>
          </div>
          <p className="text-sm text-gray-600">{formatMemberContact(invite.phone)}</p>
          {(invite.who || invite.food) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              {invite.who ? <span>{invite.who}</span> : null}
              {invite.food ? <span>{invite.food}</span> : null}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
        <span className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-200/80 text-gray-600 text-xs font-medium text-center max-w-xs">
          Confirmation sent. Waiting for tenant to accept.
        </span>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors bg-white"
        >
          <MessageCircle size={16} />
          Chat
        </button>
      </div>
    </div>
  );
}

export default function OwnerTenants() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName();
  const [activeTab, setActiveTab] = useState<TenantTab>("inquiries");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inquiries, setInquiries] = useState<OwnerTenantInquiry[]>([]);
  const [invites, setInvites] = useState<OwnerTenantInvite[]>([]);

  const ownerProperties = useMemo(() => {
    return filterOwnerProperties(getProperties(), ownerName);
  }, [ownerName]);

  const reload = useCallback(() => {
    setInquiries(getOwnerInquiries());
    setInvites(getOwnerInvites());
  }, []);

  useEffect(() => {
    const first = ownerProperties[0];
    if (first) {
      initOwnerTenantData(first.id, getPropertyInviteLabel(first));
    }
    reload();
  }, [ownerProperties, reload]);

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
            className="rounded-xl border-0 font-semibold shadow-md shadow-green-600/20 gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Send size={16} />
            Invite Tenants
          </Button>
        </div>

        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-md p-1 w-fit max-w-full overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`h-9 px-4 sm:px-6 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tabLabel(t.id)}
            </button>
          ))}
        </div>

        {activeTab === "inquiries" && (
          <div className="space-y-8">
            {invites.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Invites</h2>
                <div className="space-y-6">
                  {Array.from(invitesByProperty.entries()).map(([label, group]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-500 mb-3">{label}</p>
                      <div className="flex flex-col gap-4">
                        {group.map((inv) => (
                          <InviteCard
                            key={inv.id}
                            invite={inv}
                            onViewProfile={() => setLocation(`/owner/tenants/${inv.id}`)}
                          />
                        ))}
                      </div>
                    </div>
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
                  description="When tenants show interest in your listings, they will appear here."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {openInquiries.map((inq) => (
                    <InquiryCard
                      key={inq.id}
                      inquiry={inq}
                      onViewProfile={() => setLocation(`/owner/tenants/${inq.id}`)}
                    />
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
