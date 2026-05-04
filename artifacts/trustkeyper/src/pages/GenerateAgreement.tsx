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
    setProperties(getProperties());
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

interface UploadedDoc { name: string; dataUrl: string; size: number }

const DOC_TYPES = [
  "Tenant Aadhaar Card",
  "Tenant PAN Card",
  "Owner Aadhaar Card",
  "Previous Rent Agreement",
  "Police Verification",
  "Other",
];

function Step3Documents({
  documents, setDocuments, onContinue,
}: {
  documents: UploadedDoc[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDoc[]>>;
  onContinue: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setDocuments((prev) => [...prev, { name: file.name, dataUrl, size: file.size }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [setDocuments]);

  const removeDoc = (idx: number) => setDocuments((prev) => prev.filter((_, i) => i !== idx));

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-5">Upload supporting documents for the agreement. All documents are securely stored.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); readFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors mb-5 ${
          dragOver ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload size={22} className="text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drop files here or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG up to 10 MB each</p>
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => readFiles(e.target.files)} />
      </div>

      {/* Suggested doc types */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 font-medium mb-2">Commonly required documents</p>
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600 border border-gray-200">
              {d}
            </span>
          ))}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2 mb-2">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
              <FileText size={16} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{fmtSize(doc.size)}</p>
              </div>
              <button onClick={() => removeDoc(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ContinueButton onClick={onContinue} label={documents.length === 0 ? "Skip for now" : "Continue"} />
    </div>
  );
}

// ─── Step 4 — Details ─────────────────────────────────────────────────────────

function Step4Details({
  property,
  startDate, setStartDate,
  endDate, setEndDate,
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
  endDate: string; setEndDate: (v: string) => void;
  monthlyRent: string; setMonthlyRent: (v: string) => void;
  securityDeposit: string; setSecurityDeposit: (v: string) => void;
  lockInPeriod: string; setLockInPeriod: (v: string) => void;
  noticePeriod: string; setNoticePeriod: (v: string) => void;
  rentDueDay: string; setRentDueDay: (v: string) => void;
  maintenanceCharges: string; setMaintenanceCharges: (v: string) => void;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (property) {
      if (!monthlyRent) setMonthlyRent(property.monthlyRent || "");
      if (!securityDeposit) setSecurityDeposit(property.securityDeposit || "");
    }
  }, [property]);

  const valid = startDate && endDate && monthlyRent && securityDeposit && lockInPeriod && noticePeriod && rentDueDay;

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
              <FieldLabel required>End Date</FieldLabel>
              <TextInput type="date" value={endDate} onChange={setEndDate} />
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
            </div>
            <div>
              <FieldLabel required>Security Deposit (₹)</FieldLabel>
              <TextInput type="number" value={securityDeposit} onChange={setSecurityDeposit} placeholder="e.g. 50000" />
            </div>
            <div>
              <FieldLabel>Maintenance Charges (₹)</FieldLabel>
              <TextInput type="number" value={maintenanceCharges} onChange={setMaintenanceCharges} placeholder="Optional" />
            </div>
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

        {/* Terms */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Lock size={12} /> Terms
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Lock-in Period</FieldLabel>
              <SelectInput value={lockInPeriod} onChange={setLockInPeriod}>
                <option value="">Select period</option>
                {["1 month", "2 months", "3 months", "6 months", "11 months", "12 months"].map((v) => (
                  <option key={v} value={v}>{v}</option>
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
      </div>

      <ContinueButton onClick={onContinue} disabled={!valid} />
    </div>
  );
}

// ─── Step 5 — Brokerage ───────────────────────────────────────────────────────

function Step5Brokerage({
  brokerageAmount, setBrokerageAmount,
  brokeragePaidBy, setBrokeragePaidBy,
  brokerageMode, setBrokerageMode,
  onContinue,
}: {
  brokerageAmount: string; setBrokerageAmount: (v: string) => void;
  brokeragePaidBy: "Owner" | "Tenant" | "Both"; setBrokeragePaidBy: (v: "Owner" | "Tenant" | "Both") => void;
  brokerageMode: "Cash" | "Bank Transfer" | "UPI"; setBrokerageMode: (v: "Cash" | "Bank Transfer" | "UPI") => void;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <div>
          <FieldLabel required>Brokerage Amount (₹)</FieldLabel>
          <TextInput type="number" value={brokerageAmount} onChange={setBrokerageAmount} placeholder="e.g. 15000" />
          <p className="text-xs text-gray-400 mt-1">Leave as 0 if no brokerage is charged</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <FieldLabel required>Brokerage Paid By</FieldLabel>
          <div className="flex gap-3 mt-1">
            {(["Owner", "Tenant", "Both"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setBrokeragePaidBy(opt)}
                className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  brokeragePaidBy === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 text-gray-600 hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <FieldLabel required>Payment Mode</FieldLabel>
          <div className="flex gap-3 mt-1">
            {(["Cash", "Bank Transfer", "UPI"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setBrokerageMode(opt)}
                className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  brokerageMode === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 text-gray-600 hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ContinueButton onClick={onContinue} disabled={!brokerageAmount} />
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
  startDate, endDate, monthlyRent, securityDeposit,
  lockInPeriod, noticePeriod, rentDueDay, maintenanceCharges,
  brokerageAmount, brokeragePaidBy, brokerageMode,
  documents,
  onGoToStep, onSubmit, submitting,
}: {
  property: Property | null;
  ownerName: string; ownerContact: string;
  additionalOwners: Party[]; selectedTenants: Party[];
  startDate: string; endDate: string;
  monthlyRent: string; securityDeposit: string;
  lockInPeriod: string; noticePeriod: string; rentDueDay: string; maintenanceCharges: string;
  brokerageAmount: string; brokeragePaidBy: string; brokerageMode: string;
  documents: UploadedDoc[];
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
        { icon: Calendar, label: "End Date", value: fmtDate(endDate) },
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
        { icon: IndianRupee, label: "Brokerage Amount", value: brokerageAmount ? `₹${Number(brokerageAmount).toLocaleString("en-IN")}` : "₹0" },
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
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded</p>
            ) : (
              <div className="space-y-1.5">
                {documents.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText size={13} className="text-primary" /> {d.name}
                  </div>
                ))}
              </div>
            )}
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

  // Step 3
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  // Step 4
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [lockInPeriod, setLockInPeriod] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [rentDueDay, setRentDueDay] = useState("");
  const [maintenanceCharges, setMaintenanceCharges] = useState("");

  // Step 5
  const [brokerageAmount, setBrokerageAmount] = useState("0");
  const [brokeragePaidBy, setBrokeragePaidBy] = useState<"Owner" | "Tenant" | "Both">("Tenant");
  const [brokerageMode, setBrokerageMode] = useState<"Cash" | "Bank Transfer" | "UPI">("Bank Transfer");

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
        endDate,
        monthlyRent,
        securityDeposit,
        lockInPeriod,
        noticePeriod,
        rentDueDay,
        maintenanceCharges,
        brokerageAmount,
        brokeragePaidBy,
        brokerageMode,
        documents: documents.map((d) => ({ name: d.name, dataUrl: d.dataUrl })),
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
          documents={documents}
          setDocuments={setDocuments}
          onContinue={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Details
          property={selectedProperty}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
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
          startDate={startDate} endDate={endDate}
          monthlyRent={monthlyRent} securityDeposit={securityDeposit}
          lockInPeriod={lockInPeriod} noticePeriod={noticePeriod}
          rentDueDay={rentDueDay} maintenanceCharges={maintenanceCharges}
          brokerageAmount={brokerageAmount} brokeragePaidBy={brokeragePaidBy} brokerageMode={brokerageMode}
          documents={documents}
          onGoToStep={setStep}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </BrokerLayout>
  );
}
