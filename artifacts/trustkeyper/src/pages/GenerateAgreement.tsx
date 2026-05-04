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
} from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { getProperties, getPropertyTitle, type Property } from "@/lib/properties";
import { getTenants, type Tenant } from "@/lib/tenants";
import { addAgreement } from "@/lib/agreements";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { id: Step; label: string; shortLabel: string; Icon: React.ElementType }[] = [
  { id: 1, label: "Property", shortLabel: "Property", Icon: Home },
  { id: 2, label: "Parties", shortLabel: "Parties", Icon: Users },
  { id: 3, label: "Documents", shortLabel: "Documents", Icon: FolderOpen },
  { id: 4, label: "Details", shortLabel: "Details", Icon: FileText },
  { id: 5, label: "Brokerage", shortLabel: "Brokerage", Icon: IndianRupee },
  { id: 6, label: "Review & Send", shortLabel: "Review\n& Send", Icon: Send },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const active = s.id === current;
        const done = s.id < current;
        const Icon = s.Icon;
        return (
          <React.Fragment key={s.id}>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
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
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-gray-300 shrink-0 mx-0.5" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold transition-colors mt-6 ${
        disabled
          ? "bg-primary/40 text-white cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90"
      }`}
    >
      {label} <ChevronRight size={16} />
    </button>
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
  selected, onSelect, onContinue,
}: {
  selected: Property | null;
  onSelect: (p: Property | null) => void;
  onContinue: () => void;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const props = getProperties();
    setProperties(props);
    try {
      const pendingId = sessionStorage.getItem("agreement_pending_property");
      if (pendingId) {
        const pending = props.find((p) => p.id === pendingId);
        if (pending) { onSelect(pending); }
        sessionStorage.removeItem("agreement_pending_property");
      }
    } catch {}
  }, []);

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
    <div className="max-w-2xl">

      {selected ? (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">
                {getPropertyTitle(selected)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selected.area}, {selected.city} · {selected.unitSize !== "Other" ? selected.unitSize : selected.unitSizeOther} · {selected.furnishing}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
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
                      <p className="text-xs text-gray-500 mt-0.5">
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
        onClick={() => setLocation("/broker/properties/add2")}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors mb-0"
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
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 bg-white mb-2 ${badge ? "border-primary/30 bg-primary/5" : "border-gray-200"}`}>
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <User size={15} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{contact}</p>
      </div>
      {badge ? (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Check size={13} className="text-green-600" />
        </div>
      ) : (
        onRemove && (
          <button onClick={onRemove} className="text-xs text-red-500 font-medium hover:text-red-700 shrink-0 ml-1">
            Remove
          </button>
        )
      )}
    </div>
  );
}

function InlinePartyForm({ label, onAdd, onCancel }: {
  label: string; onAdd: (name: string, contact: string) => void; onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
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
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone"
          className="flex-1 h-9 px-3 text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { if (name.trim()) onAdd(name.trim(), contact.trim()); }}
          disabled={!name.trim()}
          className="px-5 h-9 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-5 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function TenantSearchDrop({ allTenants, onSelect, onClose }: {
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
      <div className="max-h-44 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-gray-400">No tenants found</div>
        ) : (
          filtered.map((t, i) => (
            <button
              key={t.id}
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
  onContinue,
}: {
  property: Property | null;
  ownerName: string; ownerContact: string;
  additionalOwners: Party[]; setAdditionalOwners: (v: Party[]) => void;
  selectedTenants: Party[]; setSelectedTenants: (v: Party[]) => void;
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
    setSelectedTenants([...selectedTenants, { name, contact: contact ? `+91 ${contact}` : "" }]);
    setShowTenantForm(false);
  };

  const removeTenant = (i: number) => setSelectedTenants(selectedTenants.filter((_, idx) => idx !== i));

  const canContinue = selectedTenants.length > 0;

  return (
    <div className="max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Rental Agreement Between</h2>
        <p className="text-sm text-gray-500 mt-1">Who will be part of this agreement?</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ── Owner(s) ── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Owner(s)</p>

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
              onClick={() => setShowOwnerForm(true)}
              className="flex items-center justify-between w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 hover:border-primary/50 mb-3 transition-colors"
            >
              <span>Add additional owner…</span>
              <ChevronDown size={14} className="text-gray-400" />
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
            <Plus size={14} /> Add New Owner +
          </button>
        </div>

        {/* ── Tenant(s) ── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Tenant(s)</p>

          {/* Added tenants */}
          {selectedTenants.map((t, i) => (
            <PartyCard key={i} name={t.name} contact={t.contact} onRemove={() => removeTenant(i)} />
          ))}

          {/* Choose a tenant dropdown */}
          <div ref={tenantDropRef} className="relative mb-3">
            <button
              onClick={() => { setTenantDropOpen((v) => !v); setShowTenantForm(false); }}
              className="flex items-center justify-between w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 hover:border-primary/50 transition-colors"
            >
              <span>Choose a tenant…</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {tenantDropOpen && (
              <TenantSearchDrop
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
              <Plus size={14} /> Add New Tenant +
            </button>
          )}
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

interface BankData {
  mode: "bank" | "upi";
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
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

function BankModal({ onSave, onClose }: { onSave: (d: BankData) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"bank" | "upi">("bank");
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const qrRef = useRef<HTMLInputElement>(null);
  const [qrFile, setQrFile] = useState("");

  const bankValid = holderName && bankName && accountNumber && ifscCode;
  const upiValid = upiId || qrFile;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X size={14} className="text-gray-600" />
        </button>
        <div className="px-6 pt-6 pb-2 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 text-center mb-5">Add Bank Details</h3>
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => setTab("bank")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${tab === "bank" ? "bg-accent/15 border-accent/30 text-green-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              Bank account
            </button>
            <button
              onClick={() => setTab("upi")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${tab === "upi" ? "bg-accent/15 border-accent/30 text-green-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              UPI
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {tab === "bank" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
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
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" className="w-full h-9 px-3 rounded-lg border border-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-center" />
              </div>
              <p className="text-center text-xs text-gray-400 font-medium">OR</p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">QR Code</label>
                <button
                  onClick={() => qrRef.current?.click()}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-gray-50 transition-colors"
                >
                  {qrFile ? (
                    <><Check size={20} className="text-green-500" /><span className="text-xs text-green-600 font-medium">QR uploaded</span></>
                  ) : (
                    <><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"><Plus size={14} className="text-gray-600" /></div><span className="text-xs text-gray-600 font-medium">Upload QR Code</span><span className="text-[10px] text-gray-400">(pdf, png, jpeg)</span></>
                  )}
                </button>
                <input ref={qrRef} type="file" accept=".pdf,.png,.jpeg,.jpg" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setQrFile(e.target.files[0].name); }} />
              </div>
            </>
          )}

          <button
            onClick={() => { if (tab === "bank" ? bankValid : upiValid) { onSave({ mode: tab, holderName, bankName, accountNumber, ifscCode, upiId }); } }}
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

function DocRow({ doc, personName, onUpload, onSendLink, onRemove, onAddDetails }: {
  doc: DocState;
  personName: string;
  onUpload: (file: File) => void;
  onSendLink: () => void;
  onRemove: () => void;
  onAddDetails: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${doc.status === "uploaded" ? "bg-white border-gray-200" : doc.status === "link_sent" ? "bg-white border-gray-200" : "bg-amber-50/40 border-amber-100"}`}>
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
          <p className="text-xs text-gray-500 mt-0.5">
            {doc.fileName ? `${doc.fileName} · ${doc.fileSize ? fmtFileSize(doc.fileSize) : ""} · ` : ""}
            Uploaded just now · <span className="text-green-600 font-medium">Verified ✓</span>
          </p>
        )}
        {doc.status === "link_sent" && (
          <p className="text-xs text-gray-500 mt-0.5">
            Waiting for {personName} to upload · <span className="text-blue-500">Link sent Just now</span>
          </p>
        )}
        {doc.status === "pending" && (
          <p className="text-xs text-gray-400 mt-0.5">Pending upload</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
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
            <button onClick={onSendLink} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
              <RefreshCw size={11} /> Resend
            </button>
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
            <button onClick={onSendLink} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
              <Send size={11} /> Send Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 3 Main ───────────────────────────────────────────────────────────────

function Step3Documents({
  allParties, ownerCount, onContinue,
}: {
  allParties: Party[];
  ownerCount: number;
  onContinue: () => void;
}) {
  const [persons, setPersons] = useState<PersonState[]>(() => {
    if (!allParties || allParties.length === 0) return [initPersonDocs("Owner", "", "OWNER 1")];
    let ownerIdx = 0;
    let tenantIdx = 0;
    return allParties.map((p, i) => {
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
  };

  const handleSendLink = (pIdx: number, dIdx: number) => {
    updateDoc(pIdx, dIdx, { status: "link_sent" });
  };

  const handleResetDoc = (pIdx: number, dIdx: number) => {
    updateDoc(pIdx, dIdx, { status: "pending", fileName: undefined, fileSize: undefined });
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
    updateDoc(bankModal.pIdx, bankModal.dIdx, { status: "uploaded", fileName: data.mode === "upi" ? "UPI Details" : "Bank Account", uploadedAt: Date.now() });
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
        <ContinueButton onClick={onContinue} label="Skip" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Bank modal */}
      {bankModal && <BankModal onSave={handleBankSave} onClose={() => setBankModal(null)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
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
              <p className="text-xs font-bold text-teal-600 tracking-widest mb-2">{person.personLabel}</p>
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
          <button
            onClick={() => handleSendAllPending(personIdx)}
            disabled={allDoneForPerson}
            className={`mt-3 flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border text-xs font-medium transition-colors ${allDoneForPerson ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5"}`}
          >
            <Send size={12} /> Send All Pending Links
          </button>
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
            />
          ))}
        </div>
      </div>

      {/* Navigation button */}
      <div className="mt-4">
        {isLast ? (
          <ContinueButton onClick={onContinue} disabled={!allDoneForPerson} label="Continue" />
        ) : (
          <ContinueButton onClick={() => setPersonIdx((i) => i + 1)} disabled={!allDoneForPerson} label="Next Person" />
        )}
        {!allDoneForPerson && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Upload or send link for all required documents to continue
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
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        {/* Duration */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Calendar size={12} /> Agreement Duration
          </p>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
  brokerageAmount, setBrokerageAmount,
  brokerageAmountOwner, setBrokerageAmountOwner,
  brokerageAmountTenant, setBrokerageAmountTenant,
  brokeragePaidBy, setBrokeragePaidBy,
  brokerageMode, setBrokerageMode,
  onContinue,
}: {
  brokerageAmount: string; setBrokerageAmount: (v: string) => void;
  brokerageAmountOwner: string; setBrokerageAmountOwner: (v: string) => void;
  brokerageAmountTenant: string; setBrokerageAmountTenant: (v: string) => void;
  brokeragePaidBy: "Owner" | "Tenant" | "Both"; setBrokeragePaidBy: (v: "Owner" | "Tenant" | "Both") => void;
  brokerageMode: "Bank Transfer" | "UPI"; setBrokerageMode: (v: "Bank Transfer" | "UPI") => void;
  onContinue: () => void;
}) {
  // Broker bank details (local — not persisted to agreement store)
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const qrRef = useRef<HTMLInputElement>(null);
  const [qrFile, setQrFile] = useState("");

  const amountFilled = brokeragePaidBy === "Both"
    ? (brokerageAmountOwner.trim() !== "" && brokerageAmountTenant.trim() !== "")
    : brokerageAmount.trim() !== "";

  const bankDetailsFilled = brokerageMode === "Bank Transfer"
    ? (holderName && bankName && accountNumber && ifscCode)
    : (upiId || qrFile);

  const valid = amountFilled && bankDetailsFilled;

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* Who pays? */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Who pays the brokerage?
          </p>
          <div className="flex gap-3">
            {(["Owner", "Tenant", "Both"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => { setBrokeragePaidBy(opt); setBrokerageAmount(""); setBrokerageAmountOwner(""); setBrokerageAmountTenant(""); }}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${
                  brokeragePaidBy === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Brokerage Amount
          </p>
          {brokeragePaidBy === "Both" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Owner pays (₹)</FieldLabel>
                <TextInput type="number" value={brokerageAmountOwner} onChange={setBrokerageAmountOwner} placeholder="e.g. 7500" />
              </div>
              <div>
                <FieldLabel required>Tenant pays (₹)</FieldLabel>
                <TextInput type="number" value={brokerageAmountTenant} onChange={setBrokerageAmountTenant} placeholder="e.g. 7500" />
              </div>
            </div>
          ) : (
            <div>
              <FieldLabel required>Amount (₹)</FieldLabel>
              <TextInput type="number" value={brokerageAmount} onChange={setBrokerageAmount} placeholder="e.g. 15000" />
              <p className="text-xs text-gray-400 mt-1">Enter 0 if no brokerage is charged</p>
            </div>
          )}
        </div>

        {/* Payment Mode */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            How will the broker receive payment?
          </p>
          <div className="flex gap-3 mb-5">
            {(["Bank Transfer", "UPI"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setBrokerageMode(opt)}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-colors ${
                  brokerageMode === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary/40"
                }`}
              >
                {opt === "Bank Transfer" ? "🏦 Bank Transfer" : "📱 UPI"}
              </button>
            ))}
          </div>

          {/* Broker Bank Details */}
          {brokerageMode === "Bank Transfer" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-medium">Enter your bank account details</p>
              <div className="grid grid-cols-2 gap-4">
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
                <TextInput value={upiId} onChange={setUpiId} placeholder="name@bank" />
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

      <ContinueButton onClick={onContinue} disabled={!valid} />
    </div>
  );
}

// ─── Step 6 — Review & Send ───────────────────────────────────────────────────

function ReviewRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 flex-1 text-right truncate">{value || "—"}</span>
    </div>
  );
}

function Step6Review({
  property, ownerName, ownerContact, additionalOwners, selectedTenants,
  startDate, monthlyRent, securityDeposit,
  lockInPeriod, noticePeriod, rentDueDay, maintenanceCharges,
  brokerageAmount, brokerageAmountOwner, brokerageAmountTenant, brokeragePaidBy, brokerageMode,
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
  onGoToStep: (s: Step) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const fmtDate = (v: string) => {
    if (!v) return "—";
    const d = new Date(v);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const allOwners = [{ name: ownerName, contact: ownerContact }, ...additionalOwners];
  const ownerNames = allOwners.map((o) => o.name).filter(Boolean).join(", ");
  const ownerContacts = allOwners.map((o) => o.contact).filter(Boolean).join(", ");
  const tenantNames = selectedTenants.map((t) => t.name).join(", ") || "—";
  const tenantContacts = selectedTenants.map((t) => t.contact).filter(Boolean).join(", ");

  const sections: { title: string; step: Step; rows: { icon: React.ElementType; label: string; value: string }[] }[] = [
    {
      title: "Property",
      step: 1,
      rows: [
        { icon: Home, label: "Property", value: property ? getPropertyTitle(property) : "—" },
        { icon: Building2, label: "Location", value: property ? `${property.area}, ${property.city}` : "—" },
        { icon: IndianRupee, label: "Listed Rent", value: property ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}/mo` : "—" },
      ],
    },
    {
      title: "Parties",
      step: 2,
      rows: [
        { icon: User, label: "Owner(s)", value: ownerNames },
        { icon: Phone, label: "Owner Contact", value: ownerContacts },
        { icon: Users, label: "Tenant(s)", value: tenantNames },
        { icon: Phone, label: "Tenant Contact", value: tenantContacts },
      ],
    },
    {
      title: "Agreement Details",
      step: 4,
      rows: [
        { icon: Calendar, label: "Start Date", value: fmtDate(startDate) },
        { icon: IndianRupee, label: "Monthly Rent", value: monthlyRent ? `₹${Number(monthlyRent).toLocaleString("en-IN")}` : "—" },
        { icon: Wallet, label: "Security Deposit", value: securityDeposit ? `₹${Number(securityDeposit).toLocaleString("en-IN")}` : "—" },
        { icon: Lock, label: "Lock-in Period", value: lockInPeriod },
        { icon: Bell, label: "Notice Period", value: noticePeriod },
        { icon: Calendar, label: "Rent Due Day", value: rentDueDay ? `${rentDueDay}${rentDueDay === "1" ? "st" : rentDueDay === "2" ? "nd" : rentDueDay === "3" ? "rd" : "th"} of month` : "—" },
        { icon: IndianRupee, label: "Maintenance", value: maintenanceCharges ? `₹${Number(maintenanceCharges).toLocaleString("en-IN")}` : "Not included" },
      ],
    },
    {
      title: "Brokerage",
      step: 5,
      rows: [
        {
          icon: IndianRupee, label: "Brokerage Amount",
          value: brokeragePaidBy === "Both"
            ? `Owner: ₹${Number(brokerageAmountOwner || 0).toLocaleString("en-IN")} + Tenant: ₹${Number(brokerageAmountTenant || 0).toLocaleString("en-IN")}`
            : brokerageAmount ? `₹${Number(brokerageAmount).toLocaleString("en-IN")}` : "₹0"
        },
        { icon: Users, label: "Paid By", value: brokeragePaidBy },
        { icon: Wallet, label: "Payment Mode", value: brokerageMode },
      ],
    },
  ];

  return (
    <div className="max-w-2xl">
      <div className="space-y-4 mb-6">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{sec.title}</p>
              <button onClick={() => onGoToStep(sec.step)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Edit2 size={11} /> Edit
              </button>
            </div>
            <div className="px-5 py-1">
              {sec.rows.map((r) => <ReviewRow key={r.label} {...r} />)}
            </div>
          </div>
        ))}

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Documents</p>
            <button onClick={() => onGoToStep(3)} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Edit2 size={11} /> Edit
            </button>
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={14} /> Documents collected via upload or send-link flow
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold transition-colors ${
          submitting ? "bg-primary/60 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {submitting ? (
          <><RefreshCw size={16} className="animate-spin" /> Sending…</>
        ) : (
          <><Send size={16} /> Send for E-Signing</>
        )}
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Agreement will be sent to owner and tenant for digital signatures
      </p>
    </div>
  );
}

// ─── Success Overlay ──────────────────────────────────────────────────────────

function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/15 mx-auto mb-5 flex items-center justify-center">
          <CheckCircle2 size={44} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Agreement Sent!</h2>
        <p className="text-sm text-gray-500 mb-6">
          The rental agreement has been created and sent to both parties for e-signing.
        </p>
        <div className="flex items-center gap-1.5 justify-center text-xs text-gray-500 mb-6">
          <BadgeCheck size={14} className="text-accent" />
          Powered by TrustKeyper E-Sign
        </div>
        <button
          onClick={onDone}
          className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
        >
          Go to Deals
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GenerateAgreement() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Step 2
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [additionalOwners, setAdditionalOwners] = useState<Party[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Party[]>([]);
  const tenantAadhaar = "";
  const tenantPan = "";

  // Auto-fill owner from selected property
  useEffect(() => {
    if (selectedProperty) {
      setOwnerName(selectedProperty.ownerName || "");
      setOwnerContact(selectedProperty.ownerContact || "");
    }
  }, [selectedProperty]);

  // Step 3 — managed internally by Step3Documents

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

  const stepTitles: Record<Step, string> = {
    1: "Select a property for the agreement",
    2: "Add parties to the agreement",
    3: "Upload supporting documents",
    4: "Agreement details",
    5: "Brokerage details",
    6: "Review & Send",
  };

  const handleSubmit = () => {
    if (!selectedProperty) return;
    setSubmitting(true);
    const primaryTenant = selectedTenants[0];
    setTimeout(() => {
      addAgreement({
        propertyId: selectedProperty.id,
        propertyTitle: getPropertyTitle(selectedProperty),
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
        brokerageAmount,
        brokeragePaidBy,
        brokerageMode,
        status: "Sent",
      });
      setSubmitting(false);
      setShowSuccess(true);
    }, 1200);
  };

  return (
    <BrokerLayout>
      {showSuccess && (
        <SuccessOverlay onDone={() => { setShowSuccess(false); setLocation("/broker/deals"); }} />
      )}

      {/* Back */}
      <button
        onClick={() => step === 1 ? setLocation("/broker/dashboard") : setStep((s) => (s - 1) as Step)}
        className="flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-5 hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} />
        {step === 1 ? "Back to Dashboard" : "Back"}
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate Rental Agreement</h1>
        <p className="text-sm text-gray-500 mt-1">Create and send agreement for e-signing</p>
      </div>

      {/* Progress */}
      <ProgressBar current={step} />

      {/* Step label — hidden on step 2 which has its own heading */}
      {step !== 2 && (
        <p className="text-base font-semibold text-gray-800 mb-5">{stepTitles[step]}</p>
      )}

      {/* Step Content */}
      {step === 1 && (
        <Step1Property
          selected={selectedProperty}
          onSelect={setSelectedProperty}
          onContinue={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Parties
          property={selectedProperty}
          ownerName={ownerName} ownerContact={ownerContact}
          additionalOwners={additionalOwners} setAdditionalOwners={setAdditionalOwners}
          selectedTenants={selectedTenants} setSelectedTenants={setSelectedTenants}
          onContinue={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Documents
          allParties={[
            { name: ownerName, contact: ownerContact },
            ...additionalOwners,
            ...selectedTenants,
          ]}
          ownerCount={1 + additionalOwners.length}
          onContinue={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Details
          property={selectedProperty}
          startDate={startDate} setStartDate={setStartDate}
          monthlyRent={monthlyRent} setMonthlyRent={setMonthlyRent}
          securityDeposit={securityDeposit} setSecurityDeposit={setSecurityDeposit}
          lockInPeriod={lockInPeriod} setLockInPeriod={setLockInPeriod}
          noticePeriod={noticePeriod} setNoticePeriod={setNoticePeriod}
          rentDueDay={rentDueDay} setRentDueDay={setRentDueDay}
          maintenanceCharges={maintenanceCharges} setMaintenanceCharges={setMaintenanceCharges}
          onContinue={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <Step5Brokerage
          brokerageAmount={brokerageAmount} setBrokerageAmount={setBrokerageAmount}
          brokerageAmountOwner={brokerageAmountOwner} setBrokerageAmountOwner={setBrokerageAmountOwner}
          brokerageAmountTenant={brokerageAmountTenant} setBrokerageAmountTenant={setBrokerageAmountTenant}
          brokeragePaidBy={brokeragePaidBy} setBrokeragePaidBy={setBrokeragePaidBy}
          brokerageMode={brokerageMode} setBrokerageMode={setBrokerageMode}
          onContinue={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <Step6Review
          property={selectedProperty}
          ownerName={ownerName} ownerContact={ownerContact}
          additionalOwners={additionalOwners} selectedTenants={selectedTenants}
          startDate={startDate}
          monthlyRent={monthlyRent} securityDeposit={securityDeposit}
          lockInPeriod={lockInPeriod} noticePeriod={noticePeriod}
          rentDueDay={rentDueDay} maintenanceCharges={maintenanceCharges}
          brokerageAmount={brokerageAmount} brokerageAmountOwner={brokerageAmountOwner} brokerageAmountTenant={brokerageAmountTenant}
          brokeragePaidBy={brokeragePaidBy} brokerageMode={brokerageMode}
          onGoToStep={setStep}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </BrokerLayout>
  );
}
