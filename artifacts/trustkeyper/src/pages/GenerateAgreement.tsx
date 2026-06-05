import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Home,
  Users,
  FolderOpen,
  FileText,
  IndianRupee,
  Send,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
  X,
  Upload,
  CheckCircle2,
  Building2,
  User,
  Phone,
  CreditCard,
  Calendar,
  Lock,
  Bell,
  Wallet,
  BadgeCheck,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  Clock,
  AlertTriangle,
  Link2,
  QrCode,
  Split,
} from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { FlowClearButton } from "@/components/owner/FlowClearButton";
import { StepOwnerParties } from "@/components/owner/agreement/StepOwnerParties";
import {
  StepOwnerPaymentSplit,
  buildOwnerRentSplits,
  type OwnerRentSplit,
  type RentSplitMode,
} from "@/components/owner/agreement/StepOwnerPaymentSplit";
import { broadcastBrokerPendingFlowsUpdated, clearAgreementDraftStorage } from "@/lib/brokerPendingFlows";
import { queueCloudSync } from "@/lib/cloudSync";
import { getItem, getSessionItem, removeSessionItem, setItem, setSessionItem } from "@/lib/storageKeys";
import { getProperties, getPropertyTitle, updateProperty, type Property } from "@/lib/properties";
import { ensureTenantFromAgreement, getTenants, type Tenant } from "@/lib/tenants";
import { addAgreement, getAgreements, updateAgreement, type Agreement } from "@/lib/agreements";
import {
  generateRentalAgreementText,
  shareRentalAgreementPdf,
  type RentalAgreementInput,
} from "@/lib/rentalAgreementDocument";
import { whatsAppInviteHref } from "@/lib/ownerTenants";
import { getBrokerProfile, saveBrokerProfile, hasBankDetails } from "@/lib/brokerProfile";
import {
  getOwnerProfile,
  hasOwnerBankDetails,
  hasOwnerUpiDetails,
  removeOwnerProfileDocument,
  saveOwnerProfile,
  saveOwnerProfileBank,
  saveOwnerProfileDocument,
  saveOwnerProfileUpi,
  type OwnerDocumentKind,
} from "@/lib/ownerProfile";
import { isValidUpiId, sanitizeUpiInput } from "@/lib/upi";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type BankData =
  | {
      mode: "bank";
      holderName: string;
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      upiId?: string;
      upiQrFileName?: string;
    }
  | {
      mode: "upi";
      holderName?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      upiId: string;
      upiQrFileName?: string;
    };

const STEPS: { id: Step; label: string; shortLabel: string; Icon: React.ElementType }[] = [
  { id: 1, label: "Property", shortLabel: "Property", Icon: Home },
  { id: 2, label: "Parties", shortLabel: "Parties", Icon: Users },
  { id: 3, label: "Documents", shortLabel: "Documents", Icon: FolderOpen },
  { id: 4, label: "Details", shortLabel: "Details", Icon: FileText },
  { id: 5, label: "Brokerage", shortLabel: "Brokerage", Icon: IndianRupee },
  { id: 6, label: "Review & Send", shortLabel: "Review\n& Send", Icon: Send },
];

const OWNER_STEPS: { id: Step; label: string; shortLabel: string; Icon: React.ElementType }[] = [
  { id: 1, label: "Property", shortLabel: "Property", Icon: Home },
  { id: 2, label: "Parties", shortLabel: "Parties", Icon: Users },
  { id: 3, label: "Documents", shortLabel: "Documents", Icon: FolderOpen },
  { id: 4, label: "Details", shortLabel: "Details", Icon: FileText },
  { id: 5, label: "Split", shortLabel: "Split", Icon: Split },
  { id: 6, label: "Review & Send", shortLabel: "Review\n& Send", Icon: Send },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  steps = STEPS,
}: {
  current: Step;
  steps?: typeof STEPS;
}) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  return (
    <div className="flex items-center gap-0 mb-6 sm:mb-8 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory sm:snap-none [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
      {steps.map((s, i) => {
        const active = s.id === current;
        const done = s.id < current;
        const Icon = s.Icon;
        return (
          <React.Fragment key={s.id}>
            <div
              ref={active ? activeRef : undefined}
              className={`snap-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : done
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {done ? <Check size={13} /> : <Icon size={13} />}
              <span>{s.label === "Review & Send" ? "Review & Send" : s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className="text-gray-300 shrink-0 mx-0.5 self-center snap-none" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function brokeragePercentOfRent(brokerage: string, rent: string): string | null {
  const b = Number(brokerage);
  const r = Number(rent);
  if (!Number.isFinite(r) || r <= 0) return null;
  if (!Number.isFinite(b) || b < 0) return null;
  const pct = (b / r) * 100;
  return `${pct >= 10 ? pct.toFixed(1) : pct.toFixed(2)}% of monthly rent`;
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text", className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${className}`}
    />
  );
}

function SelectInput({
  value, onChange, children, className = "",
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function ContinueButton({ onClick, disabled, label = "Continue" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  const cls = disabled
    ? "bg-primary/40 text-white cursor-not-allowed"
    : "bg-primary text-white hover:bg-primary/90";
  return (
    <>
      <div className="hidden sm:flex justify-center mt-6">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 w-48 h-11 rounded-xl text-sm font-semibold transition-colors ${cls}`}
        >
          {label} <ChevronRight size={16} />
        </button>
      </div>
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold transition-colors ${cls}`}
        >
          {label} <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

// ─── Step 1 — Property ────────────────────────────────────────────────────────

function formatRentShort(v: string) {
  const n = Number(v);
  if (!n) return "";
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K/mo`;
  return `₹${n}/mo`;
}

function Step1Property({
  selected,
  onSelect,
  onContinue,
  isOwnerFlow = false,
  ownerFilterName = "",
}: {
  selected: Property | null;
  onSelect: (p: Property | null) => void;
  onContinue: () => void;
  isOwnerFlow?: boolean;
  ownerFilterName?: string;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let props = getProperties();
    if (isOwnerFlow) {
      const name = ownerFilterName.replace("!", "").trim();
      props = props.filter((p) => p.uploadedBy === "owner" || p.ownerName === name);
    }
    setProperties(props);
    try {
      const pendingId = getSessionItem("agreement_pending_property");
      if (pendingId) {
        const pending = props.find((p) => p.id === pendingId);
        if (pending) { onSelect(pending); }
        removeSessionItem("agreement_pending_property");
      }
    } catch {}
  }, [isOwnerFlow, ownerFilterName]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = properties.filter((p) => {
    const title = getPropertyTitle(p).toLowerCase();
    const loc = `${p.area} ${p.city}`.toLowerCase();
    const q = query.toLowerCase();
    return title.includes(q) || loc.includes(q);
  });

  const handleSelect = (p: Property) => {
    onSelect(p);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="max-w-2xl w-full">

      {selected ? (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 mb-4 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm break-words">
                {getPropertyTitle(selected)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 break-words">
                {selected.area}, {selected.city} · {selected.unitSize !== "Other" ? selected.unitSize : selected.unitSizeOther} · {selected.furnishing}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs min-w-0">
                <span className="text-primary font-semibold">
                  ₹{Number(selected.monthlyRent).toLocaleString("en-IN")}/mo
                </span>
                {selected.securityDeposit && (
                  <span className="text-gray-600">Deposit: ₹{Number(selected.securityDeposit).toLocaleString("en-IN")}</span>
                )}
                {selected.floorLevel && selected.totalFloors && (
                  <span className="text-gray-600">Floor {selected.floorLevel}/{selected.totalFloors}</span>
                )}
              </div>
              {selected.amenities && selected.amenities.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {selected.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-600">
                      {a}
                    </span>
                  ))}
                  {selected.amenities.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-500">
                      +{selected.amenities.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-primary font-semibold hover:underline shrink-0"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="relative mb-4">
          <div
            className={`flex items-center gap-2 h-11 px-3 rounded-xl border bg-white cursor-text ${open ? "border-primary ring-2 ring-primary/20" : "border-gray-300"}`}
            onClick={() => setOpen(true)}
          >
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search & select a property..."
              className="flex-1 text-sm bg-transparent outline-none"
            />
            <ChevronRight size={15} className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
          </div>

          {open && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Building2 size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No properties found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Add a property first</p>
                </div>
              ) : (
                filtered.map((p, i) => {
                  const type = p.propertyType === "Other" ? (p.propertyTypeOther || "Property") : p.propertyType;
                  const size = p.unitSize === "Other" ? (p.unitSizeOther || "") : p.unitSize;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{getPropertyTitle(p)}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">
                        {p.area} · {[size, type, p.furnishing].filter(Boolean).join(" · ")}
                        {p.monthlyRent && (
                          <span className="text-primary font-medium"> · {formatRentShort(p.monthlyRent)}</span>
                        )}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() =>
          setLocation(isOwnerFlow ? "/owner/properties/add2" : "/broker/properties/add2")
        }
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-dashed border-primary text-sm font-semibold text-primary hover:bg-primary/5 transition-colors mb-0"
      >
        <Plus size={15} /> Add New Property
      </button>

      <ContinueButton onClick={onContinue} disabled={!selected} />
    </div>
  );
}

// ─── Step 2 — Parties ─────────────────────────────────────────────────────────

interface Party { name: string; contact: string; }

function PartyCard({ name, contact, badge, onRemove }: {
  name: string; contact: string; badge?: string; onRemove?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 min-h-[88px] min-w-0 overflow-hidden ${
        badge ? "border-primary/30 bg-primary/5" : "border-gray-200"
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <User size={16} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          {badge ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary uppercase tracking-wide">
              {badge}
            </span>
          ) : null}
        </div>
        {contact ? <p className="text-xs text-gray-500 mt-0.5 break-words">{contact}</p> : null}
      </div>
      {badge ? (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Check size={13} className="text-green-600" />
        </div>
      ) : (
        onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 font-medium hover:text-red-700 shrink-0"
          >
            Remove
          </button>
        ) : null
      )}
    </div>
  );
}

function InlinePartyForm({ label, onAdd, onCancel }: {
  label: string; onAdd: (name: string, contact: string) => void; onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const digits = contact.replace(/\D/g, "").slice(0, 10);
  const canAdd = name.trim().length > 0 && digits.length === 10;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 mb-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`${label} name`}
        className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <span className="px-3 h-9 flex items-center text-sm text-gray-500 border-r border-gray-200 bg-gray-50 shrink-0">+91</span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={digits}
          onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit number"
          className="flex-1 h-9 px-3 text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (canAdd) onAdd(name.trim(), digits);
          }}
          disabled={!canAdd}
          className="px-5 h-9 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function TenantSearchDrop({ listId, allTenants, onSelect, onClose }: {
  listId: string;
  allTenants: Tenant[]; onSelect: (t: Tenant) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = allTenants.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) || t.phone.includes(query)
  );

  return (
    <div ref={ref} className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tenants…"
          className="w-full h-8 px-3 rounded-md text-sm border border-gray-200 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="max-h-44 overflow-y-auto" id={listId} role="listbox" aria-label="Tenant search results">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-gray-400">No tenants found</div>
        ) : (
          filtered.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="option"
              onClick={() => onSelect(t)}
              className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
            >
              <p className="text-sm font-medium text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400">{t.phone}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Step2Parties({
  property,
  ownerName, ownerContact,
  additionalOwners, setAdditionalOwners,
  selectedTenants, setSelectedTenants,
  onManualTenantAdd,
  onContinue,
}: {
  property: Property | null;
  ownerName: string; ownerContact: string;
  additionalOwners: Party[]; setAdditionalOwners: (v: Party[]) => void;
  selectedTenants: Party[]; setSelectedTenants: (v: Party[]) => void;
  onManualTenantAdd?: (name: string, contact: string) => void;
  onContinue: () => void;
}) {
  const allTenants = getTenants();
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [tenantDropOpen, setTenantDropOpen] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const tenantDropRef = useRef<HTMLDivElement>(null);

  const addOwner = (name: string, contact: string) => {
    setAdditionalOwners([...additionalOwners, { name, contact: contact ? `+91 ${contact}` : "" }]);
    setShowOwnerForm(false);
  };

  const removeOwner = (i: number) => setAdditionalOwners(additionalOwners.filter((_, idx) => idx !== i));

  const addTenantFromSearch = (t: Tenant) => {
    if (!selectedTenants.find((s) => s.name === t.name)) {
      setSelectedTenants([...selectedTenants, { name: t.name, contact: t.phone }]);
    }
    setTenantDropOpen(false);
  };

  const addTenantManual = (name: string, contact: string) => {
    onManualTenantAdd?.(name, contact.trim());
    setSelectedTenants([...selectedTenants, { name, contact: contact ? `+91 ${contact}` : "" }]);
    setShowTenantForm(false);
  };

  const removeTenant = (i: number) => setSelectedTenants(selectedTenants.filter((_, idx) => idx !== i));

  const canContinue = selectedTenants.length > 0;

  return (
    <div className="max-w-3xl w-full mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Rental Agreement Between</h2>
        <p className="text-sm text-gray-500 mt-1">Who will be part of this agreement?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Owner(s) ── */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Owner(s)</p>
          <div className="space-y-4">

          {/* Primary owner card */}
          <PartyCard
            name={ownerName || "Owner"}
            contact={ownerContact}
            badge="Primary"
          />

          {/* Additional owners */}
          {additionalOwners.map((o, i) => (
            <PartyCard key={i} name={o.name} contact={o.contact} onRemove={() => removeOwner(i)} />
          ))}

          {/* "Add additional owner…" dropdown trigger */}
          {!showOwnerForm && (
            <button
              type="button"
              onClick={() => setShowOwnerForm(true)}
              aria-expanded={false}
              aria-haspopup="dialog"
              aria-label="Add additional owner"
              className="flex items-center justify-between w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 hover:border-primary/50 mb-3 transition-colors"
            >
              <span>Add additional owner…</span>
              <ChevronDown size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
            </button>
          )}

          {/* Inline form for additional owner */}
          {showOwnerForm && (
            <InlinePartyForm label="Owner" onAdd={addOwner} onCancel={() => setShowOwnerForm(false)} />
          )}

          {/* Add New Owner button */}
          <button
            onClick={() => { setShowOwnerForm(true); }}
            className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-primary/40 text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            <Plus size={14} /> Add New Owner
          </button>
          </div>
        </div>

        {/* ── Tenant(s) ── */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Tenant(s)</p>
          <div className="space-y-4">

          {/* Added tenants */}
          {selectedTenants.map((t, i) => (
            <PartyCard key={i} name={t.name} contact={t.contact} onRemove={() => removeTenant(i)} />
          ))}

          {/* Choose a tenant dropdown */}
          <div ref={tenantDropRef} className="relative mb-3">
            <button
              type="button"
              onClick={() => { setTenantDropOpen((v) => !v); setShowTenantForm(false); }}
              aria-expanded={tenantDropOpen}
              aria-haspopup="listbox"
              aria-controls="broker-tenant-picker-list"
              aria-label="Choose a tenant"
              className="flex items-center justify-between w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 hover:border-primary/50 transition-colors"
            >
              <span>Choose a tenant…</span>
              <ChevronDown
                size={14}
                className={`text-gray-400 shrink-0 transition-transform ${tenantDropOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {tenantDropOpen && (
              <TenantSearchDrop
                listId="broker-tenant-picker-list"
                allTenants={allTenants}
                onSelect={addTenantFromSearch}
                onClose={() => setTenantDropOpen(false)}
              />
            )}
          </div>

          {/* Add New Tenant form / button */}
          {showTenantForm ? (
            <InlinePartyForm label="Tenant" onAdd={addTenantManual} onCancel={() => setShowTenantForm(false)} />
          ) : (
            <button
              onClick={() => { setShowTenantForm(true); setTenantDropOpen(false); }}
              className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-primary/40 text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              <Plus size={14} /> Add New Tenant
            </button>
          )}
          </div>
        </div>
      </div>

      <ContinueButton onClick={onContinue} disabled={!canContinue} />
    </div>
  );
}

// ─── Step 3 — Documents ───────────────────────────────────────────────────────

type DocStatus = "pending" | "uploaded" | "link_sent";

interface DocState {
  id: "aadhaar" | "pan" | "bank";
  label: string;
  status: DocStatus;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: number;
}

interface PersonState {
  name: string;
  contact: string;
  personLabel: string;
  docs: DocState[];
}

const BANK_NAMES = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
  "Canara Bank", "Union Bank of India", "IndusInd Bank", "Yes Bank",
];

function initPersonDocs(name: string, contact: string, label: string): PersonState {
  return {
    name, contact, personLabel: label,
    docs: [
      { id: "aadhaar", label: "Aadhaar Card", status: "pending" },
      { id: "pan", label: "PAN Card", status: "pending" },
      { id: "bank", label: "Bank Account Details", status: "pending" },
    ],
  };
}

function fmtFileSize(b: number) {
  return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Bank Details Modal ────────────────────────────────────────────────────────

function BankModal({
  onSave,
  onClose,
  prefillOwnerProfile = false,
}: {
  onSave: (d: BankData) => void;
  onClose: () => void;
  prefillOwnerProfile?: boolean;
}) {
  const saved = prefillOwnerProfile ? getOwnerProfile() : null;
  const defaultTab: "bank" | "upi" =
    saved?.upiId && !hasOwnerBankDetails() ? "upi" : "bank";
  const [tab, setTab] = useState<"bank" | "upi">(defaultTab);
  const [holderName, setHolderName] = useState(saved?.bankHolderName ?? "");
  const [bankName, setBankName] = useState(saved?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(saved?.bankAccountNumber ?? "");
  const [ifscCode, setIfscCode] = useState(saved?.bankIFSC ?? "");
  const [upiId, setUpiId] = useState(saved?.upiId ?? "");
  const qrRef = useRef<HTMLInputElement>(null);
  const [qrFile, setQrFile] = useState(saved?.upiQrFileName ?? "");

  const bankValid = !!(holderName && bankName && accountNumber && ifscCode);
  const upiIdValid = isValidUpiId(upiId);
  const upiValid = upiIdValid || !!qrFile;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X size={14} className="text-gray-600" />
        </button>
        <div className="px-6 pt-6 pb-2 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 text-center mb-5">Add Bank Details</h3>
          <FlowSegmentTabs
            value={tab}
            onChange={(v) => setTab(v)}
            options={[
              { value: "bank", label: "Bank account" },
              { value: "upi", label: "UPI" },
            ]}
            className="mx-auto"
          />
        </div>

        <div className="px-6 py-5 space-y-4">
          {tab === "bank" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name*</label>
                  <input value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name*</label>
                  <div className="relative">
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full h-9 px-3 pr-7 rounded-lg border border-gray-300 text-sm appearance-none focus:outline-none focus:border-primary bg-white">
                      <option value=""></option>
                      {BANK_NAMES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Number*</label>
                  <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code*</label>
                  <input value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">UPI ID</label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(sanitizeUpiInput(e.target.value))}
                  placeholder="name@bank"
                  inputMode="email"
                  autoComplete="off"
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 text-center ${
                    upiId && !upiValid
                      ? "border-red-300 focus:ring-red-200"
                      : "border-primary focus:ring-primary/20"
                  }`}
                />
                {upiId && !upiValid ? (
                  <p className="text-xs text-red-500 text-center mt-1">Enter a valid UPI ID (e.g. name@bank)</p>
                ) : null}
              </div>
              <p className="text-xs text-gray-400 text-center font-medium">OR</p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Upload QR Code</label>
                <button
                  type="button"
                  onClick={() => qrRef.current?.click()}
                  className="w-full h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-gray-50 transition-colors"
                >
                  {qrFile ? (
                    <>
                      <Check size={18} className="text-green-500" />
                      <span className="text-xs text-green-600 font-medium">QR uploaded: {qrFile}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <Plus size={12} className="text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-600">Upload QR Code</span>
                      <span className="text-[10px] text-gray-400">(pdf, png, jpeg)</span>
                    </>
                  )}
                </button>
                <input
                  ref={qrRef}
                  type="file"
                  accept=".pdf,.png,.jpeg,.jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setQrFile(e.target.files[0].name);
                  }}
                />
              </div>
            </>
          )}

          <button
            onClick={() => {
              if (tab === "bank" ? bankValid : upiValid) {
                onSave({
                  mode: tab,
                  holderName,
                  bankName,
                  accountNumber,
                  ifscCode,
                  upiId,
                  upiQrFileName: qrFile || undefined,
                } as BankData);
                if (prefillOwnerProfile && tab === "upi" && qrFile) {
                  saveOwnerProfile({ ...getOwnerProfile(), upiQrFileName: qrFile });
                }
              }
            }}
            disabled={tab === "bank" ? !bankValid : !upiValid}
            className={`flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-semibold transition-colors ${(tab === "bank" ? bankValid : upiValid) ? "bg-primary text-white hover:bg-primary/90" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            Continue <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Row ──────────────────────────────────────────────────────────────

function DocRow({
  doc,
  personName,
  onUpload,
  onSendLink,
  onRemove,
  onAddDetails,
  hideSendLink = false,
}: {
  doc: DocState;
  personName: string;
  onUpload: (file: File) => void;
  onSendLink: () => void;
  onRemove: () => void;
  onAddDetails: () => void;
  hideSendLink?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 rounded-xl border px-4 py-3 transition-colors min-w-0 overflow-hidden ${doc.status === "uploaded" ? "bg-white border-gray-200" : doc.status === "link_sent" ? "bg-white border-gray-200" : "bg-amber-50/40 border-amber-100"}`}>
      {/* Status icon */}
      <div className="shrink-0">
        {doc.status === "uploaded" && <CheckCircle2 size={20} className="text-green-500" />}
        {doc.status === "link_sent" && <Clock size={20} className="text-blue-400" />}
        {doc.status === "pending" && <AlertTriangle size={20} className="text-amber-400" />}
      </div>

      {/* Label + info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
        {doc.status === "uploaded" && (
          <p className="text-xs text-gray-500 mt-0.5 break-words">
            {doc.fileName ? `${doc.fileName} · ${doc.fileSize ? fmtFileSize(doc.fileSize) : ""} · ` : ""}
            Uploaded just now · <span className="text-green-600 font-medium">Verified ✓</span>
          </p>
        )}
        {doc.status === "link_sent" && (
          <p className="text-xs text-gray-500 mt-0.5 break-words">
            Waiting for {personName} to upload · <span className="text-blue-500">Link sent Just now</span>
          </p>
        )}
        {doc.status === "pending" && (
          <p className="text-xs text-amber-700 mt-0.5">Pending upload</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:justify-end w-full sm:w-auto pt-1 sm:pt-0 border-t border-gray-100/80 sm:border-0 mt-1 sm:mt-0">
        {doc.status === "uploaded" && (
          <>
            <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
              <Eye size={12} /> View
            </button>
            <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"><RefreshCw size={13} /></button>
            <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </>
        )}
        {doc.status === "link_sent" && (
          <>
            {!hideSendLink ? (
              <button onClick={onSendLink} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                <RefreshCw size={11} /> Resend
              </button>
            ) : null}
            <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </>
        )}
        {doc.status === "pending" && (
          <>
            {doc.id === "bank" ? (
              <button onClick={onAddDetails} className="flex items-center gap-1 text-xs bg-primary text-white rounded-lg px-3 py-1.5 font-medium hover:bg-primary/90 transition-colors">
                <Plus size={11} /> Add Details
              </button>
            ) : (
              <>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs bg-primary text-white rounded-lg px-3 py-1.5 font-medium hover:bg-primary/90 transition-colors">
                  <Upload size={11} /> Upload
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
              </>
            )}
            {!hideSendLink ? (
              <button onClick={onSendLink} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                <Send size={11} /> Send Link
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function applyOwnerSelfDocPrefill(persons: PersonState[]): PersonState[] {
  const profile = getOwnerProfile();
  const hasBank = hasOwnerBankDetails();
  const hasUpi = hasOwnerUpiDetails();
  return persons.map((p) => {
    if (!isLoggedInOwnerParty(p, true)) return p;
    return {
      ...p,
      docs: p.docs.map((d) => {
        if (d.id === "bank" && hasBank) {
          return {
            ...d,
            status: "uploaded" as DocStatus,
            fileName: "Bank Account",
            uploadedAt: Date.now(),
          };
        }
        if (d.id === "bank" && hasUpi && !hasBank) {
          return {
            ...d,
            status: "uploaded" as DocStatus,
            fileName: "UPI Details",
            uploadedAt: Date.now(),
          };
        }
        if (d.id === "aadhaar" && profile.aadhaar?.fileName) {
          return {
            ...d,
            status: "uploaded" as DocStatus,
            fileName: profile.aadhaar.fileName,
            fileSize: profile.aadhaar.fileSize,
            uploadedAt: profile.aadhaar.uploadedAt ?? Date.now(),
          };
        }
        if (d.id === "pan" && profile.pan?.fileName) {
          return {
            ...d,
            status: "uploaded" as DocStatus,
            fileName: profile.pan.fileName,
            fileSize: profile.pan.fileSize,
            uploadedAt: profile.pan.uploadedAt ?? Date.now(),
          };
        }
        return d;
      }),
    };
  });
}

function isLoggedInOwnerParty(person: PersonState, isOwnerFlow: boolean): boolean {
  if (!isOwnerFlow || !person.personLabel.startsWith("OWNER")) return false;
  if (person.personLabel !== "OWNER" && person.personLabel !== "OWNER 1") return false;
  const profile = getOwnerProfile();
  const normPhone = (s: string) => s.replace(/\D/g, "").slice(-10);
  const profilePhone = normPhone(profile.phone);
  const personPhone = normPhone(person.contact);
  const profileName = (profile.name || getOwnerName()).replace("!", "").trim().toLowerCase();
  const personName = person.name.trim().toLowerCase();
  if (profileName && personName && profileName === personName) return true;
  if (profilePhone && personPhone && profilePhone === personPhone) return true;
  return false;
}

function isOwnerPrimarySelf(pIdx: number, person: PersonState, isOwnerFlow: boolean): boolean {
  return isLoggedInOwnerParty(person, isOwnerFlow);
}

// ── Step 3 Main ───────────────────────────────────────────────────────────────

function Step3Documents({
  allParties,
  ownerCount,
  onContinue,
  isOwnerFlow = false,
  initialPersons = [],
}: {
  allParties: Party[];
  ownerCount: number;
  onContinue: (result: { documentsComplete: boolean; persons: PersonState[] }) => void;
  isOwnerFlow?: boolean;
  initialPersons?: PersonState[];
}) {
  const [persons, setPersons] = useState<PersonState[]>(() => {
    if (initialPersons && initialPersons.length > 0) return initialPersons;
    if (!allParties || allParties.length === 0) return [initPersonDocs("Owner", "", "OWNER 1")];
    let ownerIdx = 0;
    let tenantIdx = 0;
    const built = allParties.map((p, i) => {
      let label: string;
      if (i < ownerCount) {
        ownerIdx++;
        label = ownerCount === 1 ? "OWNER" : `OWNER ${ownerIdx}`;
      } else {
        tenantIdx++;
        label = `TENANT ${tenantIdx}`;
      }
      return initPersonDocs(p.name, p.contact, label);
    });
    return isOwnerFlow ? applyOwnerSelfDocPrefill(built) : built;
  });

  const [personIdx, setPersonIdx] = useState(0);
  const [bankModal, setBankModal] = useState<{ pIdx: number; dIdx: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateDoc = (pIdx: number, dIdx: number, update: Partial<DocState>) => {
    setPersons((prev) => prev.map((p, pi) =>
      pi !== pIdx ? p : { ...p, docs: p.docs.map((d, di) => di !== dIdx ? d : { ...d, ...update }) }
    ));
  };

  const handleUpload = (pIdx: number, dIdx: number, file: File) => {
    updateDoc(pIdx, dIdx, { status: "uploaded", fileName: file.name, fileSize: file.size, uploadedAt: Date.now() });
    const person = persons[pIdx];
    const docId = person?.docs[dIdx]?.id;
    if (isOwnerPrimarySelf(pIdx, person, isOwnerFlow) && (docId === "aadhaar" || docId === "pan")) {
      saveOwnerProfileDocument(docId as OwnerDocumentKind, file);
    }
  };

  const handleSendLink = (pIdx: number, dIdx: number) => {
    updateDoc(pIdx, dIdx, { status: "link_sent" });
  };

  const handleResetDoc = (pIdx: number, dIdx: number) => {
    const person = persons[pIdx];
    const docId = person?.docs[dIdx]?.id;
    updateDoc(pIdx, dIdx, { status: "pending", fileName: undefined, fileSize: undefined });
    if (isOwnerPrimarySelf(pIdx, person, isOwnerFlow) && (docId === "aadhaar" || docId === "pan")) {
      removeOwnerProfileDocument(docId as OwnerDocumentKind);
    }
  };

  const handleSendAllPending = (pIdx: number) => {
    const person = persons[pIdx];
    const pendingCount = person.docs.filter((d) => d.status === "pending").length;
    if (pendingCount === 0) return;
    setPersons((prev) => prev.map((p, pi) =>
      pi !== pIdx ? p : { ...p, docs: p.docs.map((d) => d.status === "pending" ? { ...d, status: "link_sent" as DocStatus } : d) }
    ));
    showToast(`Upload links sent to ${person.name || "person"} for ${pendingCount} document${pendingCount > 1 ? "s" : ""} ✓`);
  };

  const handleBankSave = (data: BankData) => {
    if (!bankModal) return;
    const pIdx = bankModal.pIdx;
    const person = persons[pIdx];
    updateDoc(pIdx, bankModal.dIdx, { status: "uploaded", fileName: data.mode === "upi" ? "UPI Details" : "Bank Account", uploadedAt: Date.now() });
    if (isLoggedInOwnerParty(person, isOwnerFlow)) {
      if (
        data.mode === "bank" &&
        data.holderName &&
        data.bankName &&
        data.accountNumber &&
        data.ifscCode
      ) {
        saveOwnerProfileBank({
          holderName: data.holderName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
        });
      } else if (data.mode === "upi") {
        if (isValidUpiId(data.upiId)) saveOwnerProfileUpi(data.upiId);
        if (data.upiQrFileName) {
          saveOwnerProfile({ ...getOwnerProfile(), upiQrFileName: data.upiQrFileName });
        }
      }
    }
    setBankModal(null);
  };

  const person = persons[personIdx];
  const isLast = personIdx === persons.length - 1;
  const allDoneForPerson = person?.docs.every((d) => d.status !== "pending");
  const allDone = persons.every((p) => p.docs.every((d) => d.status !== "pending"));

  if (persons.length === 0) {
    return (
      <div className="max-w-lg text-center py-12">
        <p className="text-sm text-gray-500 mb-4">No parties selected. Go back and add owners and tenants first.</p>
        <ContinueButton onClick={() => onContinue({ documentsComplete: false, persons: [] })} label="Skip" />
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full">
      {/* Bank modal */}
      {bankModal && (
        <BankModal
          key={`${bankModal.pIdx}-${bankModal.dIdx}`}
          prefillOwnerProfile={
            isOwnerFlow &&
            isLoggedInOwnerParty(persons[bankModal.pIdx], isOwnerFlow)
          }
          onSave={handleBankSave}
          onClose={() => setBankModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 flex max-w-[min(100%,22rem)] items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Person card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Card header nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => setPersonIdx((i) => Math.max(0, i - 1))}
            disabled={personIdx === 0}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          {/* progress dots */}
          <div className="flex items-center gap-1.5">
            {persons.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i === personIdx ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        {/* Person info */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 tracking-widest mb-2">{person.personLabel}</p>
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-gray-400 shrink-0" />
                <p className="text-sm font-semibold text-gray-900">{person.name || "—"}</p>
              </div>
              <div className="flex items-center gap-4 mb-1 ml-0.5">
                {person.contact && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={11} /> {person.contact}
                  </span>
                )}
              </div>
              <button className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                <Plus size={11} /> Add alt phone
              </button>
            </div>
            {allDoneForPerson && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <Check size={11} /> All Done
              </span>
            )}
          </div>
        </div>

        {/* Doc rows */}
        <div className="px-5 pb-5 space-y-2">
          {person.docs.map((doc, dIdx) => (
            <DocRow
              key={doc.id}
              doc={doc}
              personName={person.name}
              onUpload={(file) => handleUpload(personIdx, dIdx, file)}
              onSendLink={() => handleSendLink(personIdx, dIdx)}
              onRemove={() => handleResetDoc(personIdx, dIdx)}
              onAddDetails={() => setBankModal({ pIdx: personIdx, dIdx })}
              hideSendLink
            />
          ))}
        </div>
      </div>

      {/* Navigation button */}
      <div className="mt-4">
        {isLast ? (
          <ContinueButton
            onClick={() => onContinue({ documentsComplete: allDone, persons })}
            disabled={!allDoneForPerson}
            label="Continue"
          />
        ) : (
          <ContinueButton onClick={() => setPersonIdx((i) => i + 1)} disabled={!allDoneForPerson} label="Next Person" />
        )}
        {!allDoneForPerson && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Upload all required documents to continue
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 — Details ─────────────────────────────────────────────────────────

function Step4Details({
  property,
  startDate, setStartDate,
  monthlyRent, setMonthlyRent,
  securityDeposit, setSecurityDeposit,
  lockInPeriod, setLockInPeriod,
  noticePeriod, setNoticePeriod,
  rentDueDay, setRentDueDay,
  maintenanceCharges, setMaintenanceCharges,
  onContinue,
}: {
  property: Property | null;
  startDate: string; setStartDate: (v: string) => void;
  monthlyRent: string; setMonthlyRent: (v: string) => void;
  securityDeposit: string; setSecurityDeposit: (v: string) => void;
  lockInPeriod: string; setLockInPeriod: (v: string) => void;
  noticePeriod: string; setNoticePeriod: (v: string) => void;
  rentDueDay: string; setRentDueDay: (v: string) => void;
  maintenanceCharges: string; setMaintenanceCharges: (v: string) => void;
  onContinue: () => void;
}) {
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(false);

  useEffect(() => {
    if (property) {
      if (!monthlyRent) setMonthlyRent(property.monthlyRent || "");
      if (!securityDeposit) setSecurityDeposit(property.securityDeposit || "");
      if (property.maintenanceIncluded) setMaintenanceIncluded(true);
      if (!maintenanceCharges && property.monthlyMaintenance) setMaintenanceCharges(property.monthlyMaintenance);
    }
  }, [property]);

  const handleMaintenanceToggle = (checked: boolean) => {
    setMaintenanceIncluded(checked);
    if (checked) setMaintenanceCharges("");
  };

  const valid = startDate && monthlyRent && securityDeposit && lockInPeriod && noticePeriod && rentDueDay;

  return (
    <div className="max-w-2xl w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        {/* Duration */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Calendar size={12} /> Agreement Duration
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Start Date</FieldLabel>
              <TextInput type="date" value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <FieldLabel required>Lock-in Period</FieldLabel>
              <SelectInput value={lockInPeriod} onChange={setLockInPeriod}>
                <option value="">Select period</option>
                {Array.from({ length: 11 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={`${m} ${m === 1 ? "month" : "months"}`}>
                    {m} {m === 1 ? "month" : "months"}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel required>Notice Period</FieldLabel>
              <SelectInput value={noticePeriod} onChange={setNoticePeriod}>
                <option value="">Select period</option>
                {["15 days", "1 month", "2 months", "3 months"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </SelectInput>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <IndianRupee size={12} /> Financial Terms
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Monthly Rent (₹)</FieldLabel>
              <TextInput type="number" value={monthlyRent} onChange={setMonthlyRent} placeholder="e.g. 25000" />
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintenanceIncluded}
                  onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
                <span className="text-xs text-gray-600">Maintenance included in rent</span>
              </label>
            </div>
            <div>
              <FieldLabel required>Security Deposit (₹)</FieldLabel>
              <TextInput type="number" value={securityDeposit} onChange={setSecurityDeposit} placeholder="e.g. 50000" />
            </div>
            {!maintenanceIncluded && (
              <div>
                <FieldLabel>Maintenance Charges (₹)</FieldLabel>
                <TextInput type="number" value={maintenanceCharges} onChange={setMaintenanceCharges} placeholder="Optional" />
              </div>
            )}
            <div>
              <FieldLabel required>Rent Due Day</FieldLabel>
              <SelectInput value={rentDueDay} onChange={setRentDueDay}>
                <option value="">Select day</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>{d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"} of every month</option>
                ))}
              </SelectInput>
            </div>
          </div>
        </div>
      </div>

      <ContinueButton onClick={onContinue} disabled={!valid} />
    </div>
  );
}

// ─── Step 5 — Brokerage ───────────────────────────────────────────────────────

function Step5Brokerage({
  monthlyRent,
  brokerageAmount, setBrokerageAmount,
  brokerageAmountOwner, setBrokerageAmountOwner,
  brokerageAmountTenant, setBrokerageAmountTenant,
  brokeragePaidBy, setBrokeragePaidBy,
  brokerageMode, setBrokerageMode,
  onContinue,
}: {
  monthlyRent: string;
  brokerageAmount: string; setBrokerageAmount: (v: string) => void;
  brokerageAmountOwner: string; setBrokerageAmountOwner: (v: string) => void;
  brokerageAmountTenant: string; setBrokerageAmountTenant: (v: string) => void;
  brokeragePaidBy: "Owner" | "Tenant" | "Both"; setBrokeragePaidBy: (v: "Owner" | "Tenant" | "Both") => void;
  brokerageMode: "Bank Transfer" | "UPI"; setBrokerageMode: (v: "Bank Transfer" | "UPI") => void;
  onContinue: () => void;
}) {
  // Auto-fill broker payment details from saved profile
  const savedProfile = getBrokerProfile();
  const bankMissing = !hasBankDetails();

  const [holderName, setHolderName] = useState(savedProfile.bankHolderName || "");
  const [bankName, setBankName] = useState(savedProfile.bankName || "");
  const [accountNumber, setAccountNumber] = useState(savedProfile.bankAccountNumber || "");
  const [ifscCode, setIfscCode] = useState(savedProfile.bankIFSC || "");
  const [upiId, setUpiId] = useState(savedProfile.upiId || "");
  const qrRef = useRef<HTMLInputElement>(null);
  const [qrFile, setQrFile] = useState(savedProfile.upiQrFileName || "");

  const amountFilled = brokeragePaidBy === "Both"
    ? (brokerageAmountOwner.trim() !== "" && brokerageAmountTenant.trim() !== "")
    : brokerageAmount.trim() !== "";

  const bankDetailsFilled = brokerageMode === "Bank Transfer"
    ? (holderName && bankName && accountNumber && ifscCode)
    : (isValidUpiId(upiId) || !!qrFile);

  const valid = amountFilled && bankDetailsFilled;

  return (
    <div className="max-w-2xl w-full">
      {/* Banner if broker profile bank details are missing */}
      {bankMissing && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">!</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Save your bank details to your profile</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Enter them once in{" "}
              <a href="/broker/profile" className="underline font-medium hover:text-amber-900">My Profile</a>
              {" "}and they'll be auto-filled here every time — no re-entry needed.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* Who pays? */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Who pays the brokerage?
          </p>
          <FlowSegmentTabs
            fullWidth
            value={brokeragePaidBy}
            onChange={(opt) => {
              setBrokeragePaidBy(opt);
              setBrokerageAmount("");
              setBrokerageAmountOwner("");
              setBrokerageAmountTenant("");
            }}
            options={[
              { value: "Owner", label: "Owner" },
              { value: "Tenant", label: "Tenant" },
              { value: "Both", label: "Both" },
            ]}
          />
        </div>

        {/* Amount */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Brokerage Amount
          </p>
          {brokeragePaidBy === "Both" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Owner pays (₹)</FieldLabel>
                <TextInput type="number" value={brokerageAmountOwner} onChange={setBrokerageAmountOwner} placeholder="e.g. 7500" />
                {brokeragePercentOfRent(brokerageAmountOwner, monthlyRent) && (
                  <p className="text-sm font-medium text-green-600 mt-1">{brokeragePercentOfRent(brokerageAmountOwner, monthlyRent)}</p>
                )}
              </div>
              <div>
                <FieldLabel required>Tenant pays (₹)</FieldLabel>
                <TextInput type="number" value={brokerageAmountTenant} onChange={setBrokerageAmountTenant} placeholder="e.g. 7500" />
                {brokeragePercentOfRent(brokerageAmountTenant, monthlyRent) && (
                  <p className="text-sm font-medium text-green-600 mt-1">{brokeragePercentOfRent(brokerageAmountTenant, monthlyRent)}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <FieldLabel required>Amount (₹)</FieldLabel>
              <TextInput type="number" value={brokerageAmount} onChange={setBrokerageAmount} placeholder="e.g. 15000" />
              {brokeragePercentOfRent(brokerageAmount, monthlyRent) && (
                <p className="text-sm font-medium text-green-600 mt-1">{brokeragePercentOfRent(brokerageAmount, monthlyRent)}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Enter 0 if no brokerage is charged</p>
            </div>
          )}
        </div>

        {/* Payment Mode */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            How will the broker receive payment?
          </p>
          <FlowSegmentTabs
            fullWidth
            value={brokerageMode}
            onChange={setBrokerageMode}
            options={[
              { value: "Bank Transfer", label: "Bank Transfer" },
              { value: "UPI", label: "UPI" },
            ]}
            className="mb-5"
          />

          {/* Broker Bank Details */}
          {brokerageMode === "Bank Transfer" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-medium">Enter your bank account details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Account Holder Name</FieldLabel>
                  <TextInput value={holderName} onChange={setHolderName} placeholder="Full name" />
                </div>
                <div>
                  <FieldLabel required>Bank Name</FieldLabel>
                  <div className="relative">
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-9 px-3 pr-7 rounded-lg border border-gray-300 text-sm appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value=""></option>
                      {BANK_NAMES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Account Number</FieldLabel>
                  <TextInput value={accountNumber} onChange={setAccountNumber} placeholder="Enter account number" />
                </div>
                <div>
                  <FieldLabel required>IFSC Code</FieldLabel>
                  <TextInput value={ifscCode} onChange={(v) => setIfscCode(v.toUpperCase())} placeholder="e.g. SBIN0001234" />
                </div>
              </div>
            </div>
          )}

          {/* Broker UPI Details */}
          {brokerageMode === "UPI" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-medium">Enter your UPI details</p>
              <div>
                <FieldLabel>UPI ID</FieldLabel>
                <TextInput
                  value={upiId}
                  onChange={(v) => setUpiId(sanitizeUpiInput(v))}
                  placeholder="name@bank"
                />
                {upiId && !isValidUpiId(upiId) ? (
                  <p className="text-xs text-red-500 mt-1">Enter a valid UPI ID (e.g. name@bank)</p>
                ) : null}
              </div>
              <p className="text-xs text-gray-400 text-center font-medium">OR</p>
              <div>
                <FieldLabel>QR Code</FieldLabel>
                <button
                  onClick={() => qrRef.current?.click()}
                  className="w-full h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-gray-50 transition-colors"
                >
                  {qrFile ? (
                    <><Check size={18} className="text-green-500" /><span className="text-xs text-green-600 font-medium">QR uploaded: {qrFile}</span></>
                  ) : (
                    <><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"><Plus size={12} className="text-gray-600" /></div><span className="text-xs text-gray-600">Upload QR Code</span><span className="text-[10px] text-gray-400">(pdf, png, jpeg)</span></>
                  )}
                </button>
                <input ref={qrRef} type="file" accept=".pdf,.png,.jpeg,.jpg" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setQrFile(e.target.files[0].name); }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <ContinueButton
        onClick={() => {
          // Persist whatever the broker filled in back to their profile (one-time save)
          const current = getBrokerProfile();
          if (brokerageMode === "Bank Transfer" && holderName && bankName && accountNumber && ifscCode) {
            saveBrokerProfile({ ...current, bankHolderName: holderName, bankName, bankAccountNumber: accountNumber, bankIFSC: ifscCode });
          } else if (brokerageMode === "UPI") {
            const next = { ...current };
            if (isValidUpiId(upiId)) next.upiId = upiId;
            if (qrFile) next.upiQrFileName = qrFile;
            saveBrokerProfile(next);
          }
          onContinue();
        }}
        disabled={!valid}
      />
    </div>
  );
}

// ─── Step 6 — Review & Send ───────────────────────────────────────────────────

function ReviewRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={14} className="text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 sm:w-32 shrink-0">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-800 sm:flex-1 sm:text-right pl-6 sm:pl-0 min-w-0 break-words">{value || "—"}</span>
    </div>
  );
}

function Step6Review({
  property,
  ownerName, ownerContact, additionalOwners, selectedTenants,
  startDate, monthlyRent, securityDeposit,
  lockInPeriod, noticePeriod, rentDueDay, maintenanceCharges,
  brokerageAmount, brokerageAmountOwner, brokerageAmountTenant, brokeragePaidBy, brokerageMode,
  documentsComplete,
  documentPersons = [],
  isOwnerFlow = false,
  rentSplitSummary = "",
  onGoToStep, onSubmit, submitting,
}: {
  property: Property | null;
  ownerName: string; ownerContact: string;
  additionalOwners: Party[]; selectedTenants: Party[];
  startDate: string;
  monthlyRent: string; securityDeposit: string;
  lockInPeriod: string; noticePeriod: string; rentDueDay: string; maintenanceCharges: string;
  brokerageAmount: string; brokerageAmountOwner: string; brokerageAmountTenant: string;
  brokeragePaidBy: string; brokerageMode: string;
  documentsComplete: boolean;
  documentPersons?: PersonState[];
  isOwnerFlow?: boolean;
  rentSplitSummary?: string;
  onGoToStep: (s: Step) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const fmtDate = (v: string) => {
    if (!v) return "—";
    return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const allOwners = [{ name: ownerName, contact: ownerContact }, ...additionalOwners];
  const ownerNames = allOwners.map((o) => o.name).filter(Boolean).join(", ");
  const ownerContacts = allOwners.map((o) => o.contact).filter(Boolean).join(", ");
  const tenantNames = selectedTenants.map((t) => t.name).join(", ") || "—";
  const tenantContacts = selectedTenants.map((t) => t.contact).filter(Boolean).join(", ");

  const SectionHeader = ({ title, stepTarget }: { title: string; stepTarget: Step }) => (
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
      <button
        type="button"
        onClick={() => onGoToStep(stepTarget)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Edit2 size={11} /> Edit
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl w-full">
      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Property" stepTarget={1} />
          <div className="px-5 py-1">
            <ReviewRow icon={Home} label="Property" value={property ? getPropertyTitle(property) : "—"} />
            <ReviewRow icon={Building2} label="Location" value={property ? `${property.area}, ${property.city}` : "—"} />
            <ReviewRow icon={IndianRupee} label="Listed Rent" value={property ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}/mo` : "—"} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Parties" stepTarget={2} />
          <div className="px-5 py-1">
            <ReviewRow icon={User} label="Owner(s)" value={ownerNames} />
            <ReviewRow icon={Phone} label="Owner Contact" value={ownerContacts} />
            <ReviewRow icon={Users} label="Tenant(s)" value={tenantNames} />
            <ReviewRow icon={Phone} label="Tenant Contact" value={tenantContacts} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Agreement Details" stepTarget={4} />
          <div className="px-5 py-1">
            <ReviewRow icon={Calendar} label="Start Date" value={fmtDate(startDate)} />
            <ReviewRow icon={IndianRupee} label="Monthly Rent" value={monthlyRent ? `₹${Number(monthlyRent).toLocaleString("en-IN")}` : "—"} />
            <ReviewRow icon={Wallet} label="Security Deposit" value={securityDeposit ? `₹${Number(securityDeposit).toLocaleString("en-IN")}` : "—"} />
            <ReviewRow icon={Lock} label="Lock-in Period" value={lockInPeriod} />
            <ReviewRow icon={Bell} label="Notice Period" value={noticePeriod} />
            <ReviewRow icon={Calendar} label="Rent Due Day" value={rentDueDay ? `${rentDueDay}${rentDueDay === "1" ? "st" : rentDueDay === "2" ? "nd" : rentDueDay === "3" ? "rd" : "th"} of month` : "—"} />
            <ReviewRow icon={IndianRupee} label="Maintenance" value={maintenanceCharges ? `₹${Number(maintenanceCharges).toLocaleString("en-IN")}` : "Not included"} />
          </div>
        </div>

        {isOwnerFlow ? (
          rentSplitSummary ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <SectionHeader title="Payment split between owners" stepTarget={5} />
              <div className="px-5 py-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{rentSplitSummary}</p>
              </div>
            </div>
          ) : null
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SectionHeader title="Brokerage" stepTarget={5} />
            <div className="px-5 py-1">
              <ReviewRow
                icon={IndianRupee}
                label="Brokerage Amount"
                value={
                  brokeragePaidBy === "Both"
                    ? `Owner: ₹${Number(brokerageAmountOwner || 0).toLocaleString("en-IN")} + Tenant: ₹${Number(brokerageAmountTenant || 0).toLocaleString("en-IN")}`
                    : brokerageAmount
                      ? `₹${Number(brokerageAmount).toLocaleString("en-IN")}`
                      : "₹0"
                }
              />
              <ReviewRow icon={Users} label="Paid By" value={brokeragePaidBy} />
              <ReviewRow icon={Wallet} label="Payment Mode" value={brokerageMode} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Documents" stepTarget={3} />
          <div className="px-5 py-3 space-y-3">
            {documentPersons.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded in this session.</p>
            ) : (
              documentPersons.map((person) => (
                <div key={person.personLabel} className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    {person.personLabel} — {person.name || "—"}
                  </p>
                  <ul className="space-y-1">
                    {person.docs.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-600">{doc.label}</span>
                        <span
                          className={
                            doc.status === "uploaded"
                              ? "font-medium text-green-700 truncate max-w-[55%]"
                              : "text-amber-600"
                          }
                        >
                          {doc.status === "uploaded"
                            ? doc.fileName ?? "Uploaded"
                            : "Not uploaded"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            {!documentsComplete && documentPersons.length > 0 ? (
              <p className="text-xs text-amber-700">Some documents were skipped or are still pending.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center sm:gap-4 mt-2">
        <button
          type="button"
          onClick={() => onGoToStep(1)}
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full sm:w-48 h-12 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Edit2 size={15} /> Edit Details
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className={`flex items-center justify-center gap-2 w-full sm:w-48 h-12 rounded-xl text-sm font-semibold transition-colors ${
            submitting ? "bg-primary/60 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {submitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={16} /> Send for E-Signing
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        Section Edit jumps to that step. Edit Details returns to property selection. Agreement will be sent for digital signatures.
      </p>
    </div>
  );
}

// ─── Success Overlay ──────────────────────────────────────────────────────────

function SuccessOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/15 mx-auto mb-5 flex items-center justify-center">
          <CheckCircle2 size={44} className="text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Agreement Sent!</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your agreement PDF has been downloaded. On supported devices you can share the PDF and message together; otherwise attach the downloaded PDF in WhatsApp.
        </p>
        <div className="flex items-center gap-1.5 justify-center text-xs text-gray-500 mb-6">
          <BadgeCheck size={14} className="text-accent" />
          Powered by TrustKeyper E-Sign
        </div>
        <p className="text-xs text-gray-400 mb-4">Redirecting to Documents…</p>
        <button
          onClick={onDone}
          className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
        >
          Go to Documents
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GenerateAgreement() {
  const [location, setLocation] = useLocation();
  const isOwnerFlow = location.startsWith("/owner");
  const ownerDisplayName = getOwnerName().replace("!", "").trim();
  const [step, setStep] = useState<Step>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [documentPersons, setDocumentPersons] = useState<PersonState[]>([]);

  const skipOwnerAutofillNext = useRef(false);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 1
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Step 2
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [primaryOwnerSelected, setPrimaryOwnerSelected] = useState(true);
  const [additionalOwners, setAdditionalOwners] = useState<Party[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Party[]>([]);
  const [rentSplitMode, setRentSplitMode] = useState<RentSplitMode>("percent");
  const [rentSplits, setRentSplits] = useState<OwnerRentSplit[]>([]);
  const tenantAadhaar = "";
  const tenantPan = "";

  // Step 4
  const [startDate, setStartDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [lockInPeriod, setLockInPeriod] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [rentDueDay, setRentDueDay] = useState("");
  const [maintenanceCharges, setMaintenanceCharges] = useState("");

  // Step 5
  const [brokerageAmount, setBrokerageAmount] = useState("");
  const [brokerageAmountOwner, setBrokerageAmountOwner] = useState("");
  const [brokerageAmountTenant, setBrokerageAmountTenant] = useState("");
  const [brokeragePaidBy, setBrokeragePaidBy] = useState<"Owner" | "Tenant" | "Both">("Tenant");
  const [brokerageMode, setBrokerageMode] = useState<"Bank Transfer" | "UPI">("Bank Transfer");

  const [editingAgreementId, setEditingAgreementId] = useState<string | null>(null);

  const syncPartiesToSelectedProperty = useCallback(
    (owner: string, ownerC: string, co: Party[]) => {
      if (!selectedProperty?.id) return;
      const id = selectedProperty.id;
      const coOwners = co.length ? co.map((p) => ({ name: p.name, contact: p.contact })) : undefined;
      updateProperty(id, {
        ownerName: owner,
        ownerContact: ownerC,
        coOwners,
      });
      setSelectedProperty((prev) =>
        prev && prev.id === id ? { ...prev, ownerName: owner, ownerContact: ownerC, coOwners } : prev,
      );
    },
    [selectedProperty],
  );

  // Resume saved flow (?resume=1) from dashboard banner
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "1") return;
    const raw = getItem("agreement_draft");
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as {
        step?: Step;
        selectedPropertyId?: string | null;
        ownerName?: string;
        ownerContact?: string;
        additionalOwners?: Party[];
        selectedTenants?: Party[];
        documentsComplete?: boolean;
        documentPersons?: PersonState[];
        startDate?: string;
        monthlyRent?: string;
        securityDeposit?: string;
        lockInPeriod?: string;
        noticePeriod?: string;
        rentDueDay?: string;
        maintenanceCharges?: string;
        brokerageAmount?: string;
        brokerageAmountOwner?: string;
        brokerageAmountTenant?: string;
        brokeragePaidBy?: "Owner" | "Tenant" | "Both";
        brokerageMode?: "Bank Transfer" | "UPI";
        editingAgreementId?: string | null;
      };
      const prop = d.selectedPropertyId
        ? getProperties().find((p) => p.id === d.selectedPropertyId) ?? null
        : null;
      skipOwnerAutofillNext.current = true;
      if (prop) setSelectedProperty(prop);
      if (typeof d.step === "number" && d.step >= 1 && d.step <= 6) setStep(d.step);
      setOwnerName(d.ownerName ?? "");
      setOwnerContact(d.ownerContact ?? "");
      setAdditionalOwners(d.additionalOwners ?? []);
      setSelectedTenants(d.selectedTenants ?? []);
      setDocumentsComplete(!!d.documentsComplete);
      setDocumentPersons(d.documentPersons ?? []);
      setStartDate(d.startDate ?? "");
      setMonthlyRent(d.monthlyRent ?? "");
      setSecurityDeposit(d.securityDeposit ?? "");
      setLockInPeriod(d.lockInPeriod ?? "");
      setNoticePeriod(d.noticePeriod ?? "");
      setRentDueDay(d.rentDueDay ?? "");
      setMaintenanceCharges(d.maintenanceCharges ?? "");
      setBrokerageAmount(d.brokerageAmount ?? "");
      setBrokerageAmountOwner(d.brokerageAmountOwner ?? "");
      setBrokerageAmountTenant(d.brokerageAmountTenant ?? "");
      if (d.brokeragePaidBy) setBrokeragePaidBy(d.brokeragePaidBy);
      if (d.brokerageMode) setBrokerageMode(d.brokerageMode);
      if (typeof d.editingAgreementId === "string" && d.editingAgreementId) {
        setEditingAgreementId(d.editingAgreementId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Load edit draft if coming from Documents → Edit Details
  useEffect(() => {
    const raw = getSessionItem("agreement_edit_draft");
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as {
        agreementId?: string;
        propertyId: string; ownerName: string; ownerContact: string;
        additionalOwners: Party[]; selectedTenants: Party[];
        startDate: string; monthlyRent: string; securityDeposit: string;
        lockInPeriod: string; noticePeriod: string; rentDueDay: string; maintenanceCharges: string;
        brokerageAmount: string; brokerageAmountOwner: string; brokerageAmountTenant: string;
        brokeragePaidBy: "Owner" | "Tenant" | "Both"; brokerageMode: "Bank Transfer" | "UPI";
      };
      removeSessionItem("agreement_edit_draft");
      if (d.agreementId) setEditingAgreementId(d.agreementId);
      skipOwnerAutofillNext.current = true;
      const prop = getProperties().find((p) => p.id === d.propertyId) || null;
      if (prop) setSelectedProperty(prop);
      setAdditionalOwners(d.additionalOwners || []);
      setSelectedTenants(d.selectedTenants || []);
      setStartDate(d.startDate || "");
      setMonthlyRent(d.monthlyRent || "");
      setSecurityDeposit(d.securityDeposit || "");
      setLockInPeriod(d.lockInPeriod || "");
      setNoticePeriod(d.noticePeriod || "");
      setRentDueDay(d.rentDueDay || "");
      setMaintenanceCharges(d.maintenanceCharges || "");
      setBrokerageAmount(d.brokerageAmount || "");
      setBrokerageAmountOwner(d.brokerageAmountOwner || "");
      setBrokerageAmountTenant(d.brokerageAmountTenant || "");
      setBrokeragePaidBy(d.brokeragePaidBy || "Tenant");
      setBrokerageMode(d.brokerageMode || "Bank Transfer");
      setDocumentsComplete(false);
      // Override owner name/contact after the property auto-fill runs
      setTimeout(() => {
        setOwnerName(d.ownerName || "");
        setOwnerContact(d.ownerContact || "");
      }, 0);
      setStep(6);
    } catch {}
  }, []);

  useEffect(() => {
    if (step === 3) setDocumentsComplete(false);
  }, [step]);

  useEffect(() => {
    if (!isOwnerFlow) return;
    const profile = getBrokerProfile();
    if (profile.name && !ownerName) setOwnerName(profile.name);
    const phone = profile.phone || getSessionItem("owner_phone") || getSessionItem("phone") || "";
    if (phone && !ownerContact) {
      const digits = phone.replace(/\D/g, "").slice(-10);
      if (digits.length === 10) setOwnerContact(`+91 ${digits}`);
    }
  }, [isOwnerFlow]);

  // Auto-fill owner from selected property (skip once after resuming a saved draft)
  useEffect(() => {
    if (skipOwnerAutofillNext.current) {
      skipOwnerAutofillNext.current = false;
      return;
    }
    if (selectedProperty) {
      if (!isOwnerFlow || !getBrokerProfile().name) {
        setOwnerName(selectedProperty.ownerName || "");
      }
      if (!isOwnerFlow || !getBrokerProfile().phone) {
        setOwnerContact(selectedProperty.ownerContact || "");
      }
    }
  }, [selectedProperty, isOwnerFlow]);

  // Autosave draft for resume + pending banner
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedProperty && step === 1) return;
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      try {
        const draft = {
          v: 1 as const,
          step,
          selectedPropertyId: selectedProperty?.id ?? null,
          ownerName,
          ownerContact,
          additionalOwners,
          selectedTenants,
          documentsComplete,
          documentPersons,
          startDate,
          monthlyRent,
          securityDeposit,
          lockInPeriod,
          noticePeriod,
          rentDueDay,
          maintenanceCharges,
          brokerageAmount,
          brokerageAmountOwner,
          brokerageAmountTenant,
          brokeragePaidBy,
          brokerageMode,
          editingAgreementId,
          savedAt: Date.now(),
        };
        const draftJson = JSON.stringify(draft);
        setItem("agreement_draft", draftJson);
        queueCloudSync("agreement_draft", draftJson);
        broadcastBrokerPendingFlowsUpdated();
      } catch {
        /* ignore */
      }
    }, 450);
    return () => {
      if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    };
  }, [
    step,
    selectedProperty,
    ownerName,
    ownerContact,
    additionalOwners,
    selectedTenants,
    documentsComplete,
    documentPersons,
    startDate,
    monthlyRent,
    securityDeposit,
    lockInPeriod,
    noticePeriod,
    rentDueDay,
    maintenanceCharges,
    brokerageAmount,
    brokerageAmountOwner,
    brokerageAmountTenant,
    brokeragePaidBy,
    brokerageMode,
    editingAgreementId,
  ]);

  const handleClearFlow = () => {
    clearAgreementDraftStorage();
    setStep(1);
    setShowSuccess(false);
    setSubmitting(false);
    setDocumentsComplete(false);
    setDocumentPersons([]);
    setSelectedProperty(null);
    setOwnerName("");
    setOwnerContact("");
    setPrimaryOwnerSelected(true);
    setAdditionalOwners([]);
    setSelectedTenants([]);
    setRentSplits([]);
    setRentSplitMode("percent");
    setStartDate("");
    setMonthlyRent("");
    setSecurityDeposit("");
    setLockInPeriod("");
    setNoticePeriod("");
    setRentDueDay("");
    setMaintenanceCharges("");
    setBrokerageAmount("");
    setBrokerageAmountOwner("");
    setBrokerageAmountTenant("");
    setBrokeragePaidBy("Tenant");
    setBrokerageMode("Bank Transfer");
    setEditingAgreementId(null);
  };

  // Step 3 — managed internally by Step3Documents

  const ownerCount =
    (primaryOwnerSelected ? 1 : 0) + additionalOwners.length;
  const showPaymentSplit = isOwnerFlow && ownerCount >= 2;

  const progressSteps = isOwnerFlow
    ? showPaymentSplit
      ? OWNER_STEPS
      : OWNER_STEPS.filter((s) => s.id !== 5)
    : STEPS;

  const stepTitles: Record<Step, string> = {
    1: "Select a property for the agreement",
    2: "Add parties to the agreement",
    3: "Upload supporting documents",
    4: "Agreement details",
    5: isOwnerFlow ? "Payment split between owners" : "Brokerage details",
    6: "Review & Send",
  };

  const goToNextAfterDetails = () => {
    if (showPaymentSplit) {
      const primary =
        primaryOwnerSelected && ownerName
          ? { name: ownerName, contact: ownerContact }
          : null;
      setRentSplits(buildOwnerRentSplits(primary, additionalOwners, rentSplits));
      setStep(5);
    } else {
      setStep(6);
    }
  };

  const formatRentSplitSummary = (): string => {
    if (!showPaymentSplit) return "";
    const active = rentSplits.filter((s) => s.selected);
    return active
      .map((s) => {
        if (rentSplitMode === "percent") {
          const pct = Number(s.value || 0);
          const amt = Math.round((Number(monthlyRent || 0) * pct) / 100);
          return `${s.name}: ${pct}% (₹${amt.toLocaleString("en-IN")}/mo)`;
        }
        return `${s.name}: ₹${Number(s.value || 0).toLocaleString("en-IN")}/mo`;
      })
      .join("\n");
  };

  const Layout = isOwnerFlow ? OwnerLayout : BrokerLayout;

  const handleSubmit = () => {
    if (!selectedProperty) return;
    setSubmitting(true);
    const primaryTenant = selectedTenants[0];
    const propertyTitle = getPropertyTitle(selectedProperty);
    const agreementInput: RentalAgreementInput = {
      propertyTitle,
      propertyAddress: [selectedProperty.address, selectedProperty.area, selectedProperty.city]
        .filter(Boolean)
        .join(", "),
      ownerName,
      ownerContact,
      additionalOwnerNames: additionalOwners.map((o) => o.name).filter(Boolean).join(", "),
      tenantName: primaryTenant?.name ?? "",
      tenantContact: primaryTenant?.contact ?? "",
      coTenantName: selectedTenants.slice(1).map((t) => t.name).join(", "),
      coTenantContact: selectedTenants.slice(1).map((t) => t.contact).join(", "),
      startDate,
      monthlyRent,
      securityDeposit,
      lockInPeriod,
      noticePeriod,
      rentDueDay,
      maintenanceCharges,
      brokerageAmount: isOwnerFlow ? "0" : brokerageAmount,
      brokeragePaidBy: isOwnerFlow ? "Owner" : brokeragePaidBy,
      brokerageMode: isOwnerFlow ? "Bank Transfer" : brokerageMode,
      isOwnerFlow,
    };
    const agreementText = generateRentalAgreementText(agreementInput);
    const waPhone = primaryTenant?.contact || ownerContact;

    const senderLabel = isOwnerFlow
      ? (ownerName?.trim() ? ownerName.trim() : "Owner")
      : (getBrokerProfile().name?.trim() ? getBrokerProfile().name.trim() : "Broker");
    const shareMessage =
      `Rental agreement for:\n` +
      `${propertyTitle}\n\n` +
      `Sent by ${senderLabel} via TrustKeyper.\n\n` +
      `Please review the attached PDF.`;

    void shareRentalAgreementPdf(agreementInput, propertyTitle, waPhone, whatsAppInviteHref, shareMessage);

    setTimeout(() => {
      const mode = brokerageMode as Agreement["brokerageMode"];
      const customText =
        isOwnerFlow && showPaymentSplit
          ? JSON.stringify({ rentSplitMode, rentSplits, agreementText })
          : agreementText;
      const base = {
        propertyId: selectedProperty.id,
        propertyTitle,
        ownerName,
        ownerContact,
        tenantName: primaryTenant?.name ?? "",
        tenantContact: primaryTenant?.contact ?? "",
        tenantAadhaar,
        tenantPan,
        coTenantName: selectedTenants.slice(1).map((t) => t.name).join(", "),
        coTenantContact: selectedTenants.slice(1).map((t) => t.contact).join(", "),
        startDate,
        endDate: "",
        monthlyRent,
        securityDeposit,
        lockInPeriod,
        noticePeriod,
        rentDueDay,
        maintenanceCharges,
        brokerageAmount: isOwnerFlow ? "0" : brokerageAmount,
        brokeragePaidBy: isOwnerFlow ? "Owner" : brokeragePaidBy,
        brokerageMode: isOwnerFlow ? "Bank Transfer" : mode,
        customText,
      };

      if (editingAgreementId) {
        const existing = getAgreements().find((a) => a.id === editingAgreementId);
        if (existing) {
          updateAgreement(editingAgreementId, {
            ...base,
            tenantAadhaar: existing.tenantAadhaar,
            tenantPan: existing.tenantPan,
            documents: existing.documents,
            status: "Sent",
          });
        }
        setEditingAgreementId(null);
      } else {
        addAgreement({ ...base, status: "Sent" });
      }
      setSubmitting(false);
      setShowSuccess(true);
      clearAgreementDraftStorage();
    }, 400);
  };

  return (
    <Layout>
      {showSuccess && (
        <SuccessOverlay
          onDone={() => {
            setShowSuccess(false);
            setLocation(isOwnerFlow ? "/owner/agreements" : "/broker/documents");
          }}
        />
      )}

      <div
        className={
          isOwnerFlow
            ? "p-4 sm:p-8 max-w-6xl mx-auto w-full min-w-0"
            : "min-w-0 w-full"
        }
      >
      <div className={`min-w-0 w-full max-w-full ${step !== 6 ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-6" : "pb-6"}`}>
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <button
          type="button"
          onClick={() => {
            if (step === 1) {
              setLocation(isOwnerFlow ? "/owner/agreements" : "/broker/dashboard");
              return;
            }
            if (step === 6 && isOwnerFlow && !showPaymentSplit) {
              setStep(4);
              return;
            }
            setStep((s) => (s - 1) as Step);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-600 font-medium hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} />
          {step === 1
            ? isOwnerFlow
              ? "Back to Agreements"
              : "Back to Dashboard"
            : "Back"}
        </button>
        <FlowClearButton onClick={handleClearFlow} />
      </div>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">Generate Rental Agreement</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Create and send agreement for e-signing</p>
      </div>

      {/* Progress */}
      <ProgressBar current={step} steps={progressSteps} />

      {/* Step label — hidden on step 2 which has its own heading */}
      {step !== 2 && !(step === 5 && isOwnerFlow && showPaymentSplit) && (
        <p className="text-sm sm:text-base font-semibold text-gray-800 mb-4 sm:mb-5">{stepTitles[step]}</p>
      )}

      {/* Step Content */}
      {step === 1 && (
        <Step1Property
          selected={selectedProperty}
          onSelect={setSelectedProperty}
          onContinue={() => setStep(2)}
          isOwnerFlow={isOwnerFlow}
          ownerFilterName={ownerDisplayName}
        />
      )}
      {step === 2 && isOwnerFlow && (
        <StepOwnerParties
          property={selectedProperty}
          ownerName={ownerName}
          ownerContact={ownerContact}
          primaryOwnerSelected={primaryOwnerSelected}
          onPrimaryOwnerSelectedChange={setPrimaryOwnerSelected}
          additionalOwners={additionalOwners}
          setAdditionalOwners={setAdditionalOwners}
          selectedTenants={selectedTenants}
          setSelectedTenants={setSelectedTenants}
          onManualTenantAdd={(name, contact) => ensureTenantFromAgreement(name, contact)}
          onContinue={() => {
            if (primaryOwnerSelected) {
              syncPartiesToSelectedProperty(ownerName, ownerContact, additionalOwners);
            }
            setStep(3);
          }}
        />
      )}
      {step === 2 && !isOwnerFlow && (
        <Step2Parties
          property={selectedProperty}
          ownerName={ownerName}
          ownerContact={ownerContact}
          additionalOwners={additionalOwners}
          setAdditionalOwners={setAdditionalOwners}
          selectedTenants={selectedTenants}
          setSelectedTenants={setSelectedTenants}
          onManualTenantAdd={(name, contact) => ensureTenantFromAgreement(name, contact)}
          onContinue={() => {
            syncPartiesToSelectedProperty(ownerName, ownerContact, additionalOwners);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <Step3Documents
          allParties={[
            ...(primaryOwnerSelected ? [{ name: ownerName, contact: ownerContact }] : []),
            ...additionalOwners,
            ...selectedTenants,
          ]}
          ownerCount={ownerCount}
          isOwnerFlow={isOwnerFlow}
          initialPersons={documentPersons}
          onContinue={(result) => {
            setDocumentsComplete(result.documentsComplete);
            setDocumentPersons(result.persons);
            setStep(4);
          }}
        />
      )}
      {step === 4 && (
        <Step4Details
          property={selectedProperty}
          startDate={startDate}
          setStartDate={setStartDate}
          monthlyRent={monthlyRent}
          setMonthlyRent={setMonthlyRent}
          securityDeposit={securityDeposit}
          setSecurityDeposit={setSecurityDeposit}
          lockInPeriod={lockInPeriod}
          setLockInPeriod={setLockInPeriod}
          noticePeriod={noticePeriod}
          setNoticePeriod={setNoticePeriod}
          rentDueDay={rentDueDay}
          setRentDueDay={setRentDueDay}
          maintenanceCharges={maintenanceCharges}
          setMaintenanceCharges={setMaintenanceCharges}
          onContinue={goToNextAfterDetails}
        />
      )}
      {step === 5 && isOwnerFlow && showPaymentSplit && (
        <StepOwnerPaymentSplit
          monthlyRent={monthlyRent}
          splitMode={rentSplitMode}
          setSplitMode={setRentSplitMode}
          splits={rentSplits}
          setSplits={setRentSplits}
          onContinue={() => setStep(6)}
        />
      )}
      {step === 5 && !isOwnerFlow && (
        <Step5Brokerage
          monthlyRent={monthlyRent}
          brokerageAmount={brokerageAmount}
          setBrokerageAmount={setBrokerageAmount}
          brokerageAmountOwner={brokerageAmountOwner}
          setBrokerageAmountOwner={setBrokerageAmountOwner}
          brokerageAmountTenant={brokerageAmountTenant}
          setBrokerageAmountTenant={setBrokerageAmountTenant}
          brokeragePaidBy={brokeragePaidBy}
          setBrokeragePaidBy={setBrokeragePaidBy}
          brokerageMode={brokerageMode}
          setBrokerageMode={setBrokerageMode}
          onContinue={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <Step6Review
          property={selectedProperty}
          ownerName={ownerName}
          ownerContact={ownerContact}
          additionalOwners={additionalOwners}
          selectedTenants={selectedTenants}
          startDate={startDate}
          monthlyRent={monthlyRent}
          securityDeposit={securityDeposit}
          lockInPeriod={lockInPeriod}
          noticePeriod={noticePeriod}
          rentDueDay={rentDueDay}
          maintenanceCharges={maintenanceCharges}
          brokerageAmount={brokerageAmount}
          brokerageAmountOwner={brokerageAmountOwner}
          brokerageAmountTenant={brokerageAmountTenant}
          brokeragePaidBy={brokeragePaidBy}
          brokerageMode={brokerageMode}
          documentsComplete={documentsComplete}
          documentPersons={documentPersons}
          isOwnerFlow={isOwnerFlow}
          rentSplitSummary={formatRentSplitSummary()}
          onGoToStep={setStep}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      </div>
      </div>
    </Layout>
  );
}
