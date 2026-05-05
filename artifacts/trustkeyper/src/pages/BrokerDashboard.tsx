import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus, UserPlus, FilePlus2, ArrowRight, Check,
  IndianRupee, Building2, Users, ChevronRight,
  Clock, FileCheck2, Dot,
} from "lucide-react";
import BrokerLayout, { getBrokerName } from "@/components/BrokerLayout";
import { getProperties, getPropertyTitle } from "@/lib/properties";
import { getTenants, timeAgo } from "@/lib/tenants";
import { getAgreements } from "@/lib/agreements";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function fmtINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Welcome Dashboard (empty state) ──────────────────────────────────────────

function WelcomeDashboard({
  brokerName,
  onGenerateAgreement,
  onAddProperty,
  onAddTenant,
}: {
  brokerName: string;
  onGenerateAgreement: () => void;
  onAddProperty: () => void;
  onAddTenant: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="text-2xl font-bold text-primary">
          Welcome, {brokerName} <span className="inline-block">👋</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={onGenerateAgreement} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> Generate Rent Agreement
          </button>
          <button onClick={onAddProperty} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
            <Plus size={16} /> Add Property
          </button>
          <button onClick={onAddTenant} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
            <UserPlus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <FilePlus2 size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Rental Agreement</h3>
          <p className="text-sm text-gray-500 mb-6">Generate rental agreements, collect documents, and complete digital signing, all in one place with TrustKeyper.</p>
          <button onClick={onGenerateAgreement} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Continue <ArrowRight size={14} />
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <Plus size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Add Your First Property</h3>
          <p className="text-sm text-gray-500 mb-6">List and manage your property details to start renting seamlessly through TrustKeyper.</p>
          <button onClick={onAddProperty} className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline transition-colors">
            <Plus size={14} /> Add Property
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <UserPlus size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Add Potential Tenants</h3>
          <p className="text-sm text-gray-500 mb-6">Add tenant details, send invitations, and manage the rental process digitally through TrustKeyper.</p>
          <button onClick={onAddTenant} className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline transition-colors">
            <UserPlus size={14} /> Add Tenant
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500 w-12">22:40</span>
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
            <Check size={16} />
          </div>
          <span className="text-sm text-gray-900">Your Profile has been created</span>
        </div>
        <button className="w-full text-center text-sm text-accent font-medium pt-4 hover:underline">View All Activity</button>
      </div>
    </>
  );
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────

type DealCard = {
  id: string;
  propertyTitle: string;
  tenantName: string;
  monthlyRent: string;
  brokerageAmount: string;
  createdAt: number;
  stage: "lead" | "agreement" | "completed";
};

function DealCardItem({ card, onClick }: { card: DealCard; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
    >
      <p className="text-sm font-bold text-gray-900 mb-1 truncate">{card.propertyTitle}</p>
      <p className="text-xs text-gray-500 mb-4">
        {card.tenantName ? `Tenant: ${card.tenantName}` : "Tenant TBD"}
      </p>
      <div className="flex items-center justify-between">
        <div>
          {card.monthlyRent ? (
            <p className="text-xs text-gray-500">{fmtINR(Number(card.monthlyRent))}/mo</p>
          ) : (
            <p className="text-xs text-gray-400">Rent TBD</p>
          )}
          <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(card.createdAt)}</p>
        </div>
        {card.brokerageAmount && Number(card.brokerageAmount) > 0 && (
          <p className="text-sm font-bold text-primary">{fmtINR(Number(card.brokerageAmount))}</p>
        )}
      </div>
    </div>
  );
}

// ─── Active Dashboard ──────────────────────────────────────────────────────────

function ActiveDashboard({
  brokerName,
  onGenerateAgreement,
  onAddProperty,
  onAddTenant,
  onViewDeals,
  onViewDocuments,
}: {
  brokerName: string;
  onGenerateAgreement: () => void;
  onAddProperty: () => void;
  onAddTenant: () => void;
  onViewDeals: () => void;
  onViewDocuments: () => void;
}) {
  const properties = getProperties();
  const tenants = getTenants();
  const agreements = getAgreements();

  type Tab = "lead" | "agreement" | "completed";
  const [activeTab, setActiveTab] = useState<Tab>("lead");

  // Stats
  const totalEarned = agreements.reduce((s, a) => s + (Number(a.brokerageAmount) || 0), 0);
  const activePropertyCount = properties.filter((p) => p.status === "Active").length;
  const leadsInPipeline = tenants.length;

  // Pipeline counts
  const leadCount = tenants.length;
  const agreementCount = agreements.filter((a) => a.status === "Sent").length;
  const completedCount = agreements.filter((a) => a.status === "Signed").length;

  // Deal cards per stage
  const leadCards: DealCard[] = tenants.map((t) => ({
    id: t.id,
    propertyTitle: t.city ? `Looking in ${t.city}${t.localities?.length ? ` — ${t.localities[0]}` : ""}` : "Property search in progress",
    tenantName: t.name,
    monthlyRent: "",
    brokerageAmount: "",
    createdAt: t.createdAt,
    stage: "lead",
  }));

  const agreementCards: DealCard[] = agreements
    .filter((a) => a.status === "Sent")
    .map((a) => ({
      id: a.id,
      propertyTitle: a.propertyTitle,
      tenantName: a.tenantName,
      monthlyRent: a.monthlyRent,
      brokerageAmount: a.brokerageAmount,
      createdAt: a.createdAt,
      stage: "agreement",
    }));

  const completedCards: DealCard[] = agreements
    .filter((a) => a.status === "Signed")
    .map((a) => ({
      id: a.id,
      propertyTitle: a.propertyTitle,
      tenantName: a.tenantName,
      monthlyRent: a.monthlyRent,
      brokerageAmount: a.brokerageAmount,
      createdAt: a.createdAt,
      stage: "completed",
    }));

  const visibleCards =
    activeTab === "lead" ? leadCards : activeTab === "agreement" ? agreementCards : completedCards;

  // Subtitle
  const inProgress = agreementCount;
  const newLeads = tenants.filter((t) => Date.now() - t.createdAt < 7 * 24 * 60 * 60 * 1000).length;
  const subtitle =
    inProgress > 0 && newLeads > 0
      ? `You have ${inProgress} deal${inProgress !== 1 ? "s" : ""} in progress and ${newLeads} new lead${newLeads !== 1 ? "s" : ""}`
      : inProgress > 0
      ? `You have ${inProgress} deal${inProgress !== 1 ? "s" : ""} in progress`
      : newLeads > 0
      ? `You have ${newLeads} new lead${newLeads !== 1 ? "s" : ""}`
      : `Welcome back, let's close some deals`;

  // Recent activity feed
  const recentActivity: { id: string; label: string; time: number; type: "agreement" | "property" | "tenant" }[] = [
    ...agreements.map((a) => ({
      id: a.id,
      label: `Agreement sent for ${a.propertyTitle}`,
      time: a.createdAt,
      type: "agreement" as const,
    })),
    ...properties.map((p) => ({
      id: p.id,
      label: `Property added: ${getPropertyTitle(p)}`,
      time: p.createdAt,
      type: "property" as const,
    })),
    ...tenants.map((t) => ({
      id: t.id,
      label: `Tenant registered: ${t.name}`,
      time: t.createdAt,
      type: "tenant" as const,
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const activityIcon = (type: string) => {
    if (type === "agreement") return <FileCheck2 size={14} className="text-primary" />;
    if (type === "property") return <Building2 size={14} className="text-amber-500" />;
    return <Users size={14} className="text-accent" />;
  };

  const activityBg = (type: string) => {
    if (type === "agreement") return "bg-primary/10";
    if (type === "property") return "bg-amber-50";
    return "bg-accent/10";
  };

  const tabStyles = (tab: Tab) => {
    const active = activeTab === tab;
    if (tab === "lead") return active ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
    if (tab === "agreement") return active ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
    return active ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
  };

  const dotColor = (tab: Tab) => {
    if (tab === "lead") return "bg-primary";
    if (tab === "agreement") return "bg-amber-500";
    return "bg-gray-400";
  };

  const countBg = (tab: Tab) => {
    if (tab === "lead") return "bg-primary/15 text-primary";
    if (tab === "agreement") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {brokerName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onGenerateAgreement} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus size={15} /> Generate Rent Agreement
          </button>
          <button onClick={onAddProperty} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Add Property
          </button>
          <button onClick={onAddTenant} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Add Tenant
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <IndianRupee size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtINR(totalEarned)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Earned</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Building2 size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activePropertyCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active Properties</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
            <Users size={18} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{leadsInPipeline}</p>
          <p className="text-xs text-gray-500 mt-1">Leads in Pipeline</p>
        </div>
      </div>

      {/* ── Deals Pipeline ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Deals Pipeline</h2>
          <button onClick={onViewDeals} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View All Deals <ChevronRight size={15} />
          </button>
        </div>

        {/* Pipeline tabs — same 3-col grid as the cards below */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {(["lead", "agreement", "completed"] as Tab[]).map((tab) => {
            const count = tab === "lead" ? leadCount : tab === "agreement" ? agreementCount : completedCount;
            const label = tab === "lead" ? "Lead" : tab === "agreement" ? "Agreement" : "Completed";
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-between w-full px-4 h-11 rounded-xl border text-sm font-semibold transition-colors ${tabStyles(tab)}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor(tab)}`} />
                  {label}
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${countBg(tab)}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Deal cards grid */}
        {visibleCards.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 border-dashed py-12 text-center">
            <p className="text-sm text-gray-400">No deals in this stage yet</p>
            {activeTab === "lead" && (
              <button onClick={onAddTenant} className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                <Plus size={13} /> Add a tenant lead
              </button>
            )}
            {activeTab === "agreement" && (
              <button onClick={onGenerateAgreement} className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                <Plus size={13} /> Generate agreement
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {visibleCards.map((card) => (
              <DealCardItem
                key={card.id}
                card={card}
                onClick={activeTab !== "lead" ? onViewDocuments : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No activity yet</div>
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-xs text-gray-400 w-16 shrink-0 font-mono">
                  {new Date(item.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${activityBg(item.type)}`}>
                  {activityIcon(item.type)}
                </div>
                <span className="text-sm text-gray-800 flex-1 truncate">{item.label}</span>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.time)}</span>
              </div>
            ))
          )}
          <div className="px-5 py-3 text-center">
            <button onClick={() => setLocation("/broker/activity")} className="text-sm text-primary font-medium hover:underline">View All Activity</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BrokerDashboard() {
  const brokerName = getBrokerName();
  const [, setLocation] = useLocation();

  const goGenerateAgreement = () => setLocation("/broker/agreements/generate");
  const goAddProperty = () => setLocation("/broker/properties/add");
  const goAddTenant = () => setLocation("/broker/tenants/add");
  const goDeals = () => setLocation("/broker/deals");
  const goDocuments = () => setLocation("/broker/documents");

  const properties = getProperties();
  const tenants = getTenants();
  const agreements = getAgreements();
  const hasData = properties.length > 0 || tenants.length > 0 || agreements.length > 0;

  return (
    <BrokerLayout>
      {hasData ? (
        <ActiveDashboard
          brokerName={brokerName}
          onGenerateAgreement={goGenerateAgreement}
          onAddProperty={goAddProperty}
          onAddTenant={goAddTenant}
          onViewDeals={goDeals}
          onViewDocuments={goDocuments}
        />
      ) : (
        <WelcomeDashboard
          brokerName={brokerName}
          onGenerateAgreement={goGenerateAgreement}
          onAddProperty={goAddProperty}
          onAddTenant={goAddTenant}
        />
      )}
    </BrokerLayout>
  );
}
