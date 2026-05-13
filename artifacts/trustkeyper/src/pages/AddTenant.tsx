import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Link2,
  UserPlus,
  ChevronDown,
  ArrowRight,
  X,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Send,
  Smartphone,
  MapPin,
  CheckCircle2,
  FileText,
} from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { broadcastBrokerPendingFlowsUpdated } from "@/lib/brokerPendingFlows";
import {
  addTenant,
  CITY_LOCALITIES,
  type Identify,
  type PropertyType,
  type Sharing,
  type Roommate,
} from "@/lib/tenants";

type ModalStep = "closed" | "form" | "share";
type Step = 1 | 2;

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "House",
  "Studio",
  "Villa",
  "PG/Hostel",
  "Other",
];
const SHARING_OPTIONS: Sharing[] = ["Single", "Double", "Triple", "Entire Property"];

export default function AddTenant() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const TENANT_DRAFT_KEY = "broker_add_tenant_draft";
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // wizard step
  const [step, setStep] = useState<Step>(1);

  // generate-link modal flow (unchanged)
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [linkName, setLinkName] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 1 — Tenant L1
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupancyFrom, setOccupancyFrom] = useState("");
  const [who, setWho] = useState<"Family" | "Bachelor" | "">("");
  const [identify, setIdentify] = useState<Identify[]>([]);
  const [food, setFood] = useState<"Veg" | "Non-Veg" | "">("");

  // Step 2 — Location & Property Preference
  const [city, setCity] = useState<string>("Hyderabad");
  const [localities, setLocalities] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [sharing, setSharing] = useState<Sharing | "">("");
  const [roommate, setRoommate] = useState<Roommate[]>([]);
  const [localityInput, setLocalityInput] = useState("");

  // Success modal
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(TENANT_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (d.step === 1 || d.step === 2) setStep(d.step as Step);
      if (typeof d.name === "string") setName(d.name);
      if (typeof d.phone === "string") setPhone(d.phone);
      if (typeof d.occupancyFrom === "string") setOccupancyFrom(d.occupancyFrom);
      if (d.who === "Family" || d.who === "Bachelor") setWho(d.who);
      if (Array.isArray(d.identify)) setIdentify(d.identify as Identify[]);
      if (d.food === "Veg" || d.food === "Non-Veg") setFood(d.food);
      if (typeof d.city === "string" && d.city) setCity(d.city);
      if (Array.isArray(d.localities)) setLocalities(d.localities as string[]);
      if (d.propertyType) setPropertyType(d.propertyType as PropertyType);
      if (d.sharing) setSharing(d.sharing as Sharing);
      if (Array.isArray(d.roommate)) setRoommate(d.roommate as Roommate[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(
          TENANT_DRAFT_KEY,
          JSON.stringify({
            v: 1,
            step,
            name,
            phone,
            occupancyFrom,
            who,
            identify,
            food,
            city,
            localities,
            propertyType,
            sharing,
            roommate,
          }),
        );
        broadcastBrokerPendingFlowsUpdated();
      } catch {
        /* ignore */
      }
    }, 450);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [
    step,
    name,
    phone,
    occupancyFrom,
    who,
    identify,
    food,
    city,
    localities,
    propertyType,
    sharing,
    roommate,
  ]);

  const handleClearTenantForm = () => {
    try {
      sessionStorage.removeItem(TENANT_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setStep(1);
    setModalStep("closed");
    setLinkName("");
    setLinkPhone("");
    setGeneratedLink("");
    setCopied(false);
    setName("");
    setPhone("");
    setOccupancyFrom("");
    setWho("");
    setIdentify([]);
    setFood("");
    setCity("Hyderabad");
    setLocalities([]);
    setPropertyType("");
    setSharing("");
    setRoommate([]);
    setLocalityInput("");
    setSuccessOpen(false);
    broadcastBrokerPendingFlowsUpdated();
  };

  const linkValid =
    linkName.trim().length > 0 && linkPhone.trim().length === 10;

  const step1Valid = useMemo(() => {
    if (
      name.trim().length === 0 ||
      phone.trim().length !== 10 ||
      !occupancyFrom ||
      !who ||
      !food
    )
      return false;
    if (who === "Bachelor" && identify.length === 0) return false;
    return true;
  }, [name, phone, occupancyFrom, who, identify, food]);

  const step2Valid = useMemo(() => {
    if (localities.length === 0) return false;
    if (!propertyType) return false;
    if (!sharing) return false;
    if (sharing !== "Entire Property" && roommate.length === 0) return false;
    return true;
  }, [localities, propertyType, sharing, roommate]);

  const openLinkModal = () => {
    setLinkName("");
    setLinkPhone("");
    setGeneratedLink("");
    setCopied(false);
    setModalStep("form");
  };

  const handleGenerateLink = () => {
    if (!linkValid) return;
    const code = Math.random().toString(36).slice(2, 12).toUpperCase();
    const link = `https://app.trustkeyper.in/tenant/onboard/${code}`;
    setGeneratedLink(link);
    addTenant({
      name: linkName,
      phone: `+91${linkPhone}`,
      invitationSent: true,
    });
    setModalStep("share");
    toast({ description: "Onboarding link generated!" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleStep1Continue = () => {
    if (!step1Valid) return;
    setStep(2);
  };

  const persistTenant = (complete: boolean) => {
    addTenant({
      name,
      phone: `+91${phone}`,
      occupancyFrom,
      who: who as "Family" | "Bachelor",
      identify: who === "Bachelor" ? identify : undefined,
      food: food as "Veg" | "Non-Veg",
      city: complete ? city : undefined,
      localities: complete ? localities : undefined,
      propertyType: complete ? (propertyType as PropertyType) : undefined,
      sharing: complete ? (sharing as Sharing) : undefined,
      roommate:
        complete && sharing !== "Entire Property" ? roommate : undefined,
      detailsComplete: complete,
    });
    try {
      sessionStorage.removeItem(TENANT_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    broadcastBrokerPendingFlowsUpdated();
    toast({ description: "Tenant added successfully!" });
    setSuccessOpen(true);
  };

  const handleSaveDetails = () => {
    if (!step2Valid) return;
    persistTenant(true);
  };

  const handleSkipSave = () => {
    persistTenant(false);
  };

  const toggleIdentify = (v: Identify) => {
    setIdentify((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const toggleRoommate = (v: Roommate) => {
    setRoommate((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const addLocality = (loc: string) => {
    if (!loc) return;
    if (localities.includes(loc)) return;
    if (localities.length >= 4) {
      toast({ description: "You can choose up to 4 localities" });
      return;
    }
    setLocalities([...localities, loc]);
    setLocalityInput("");
  };

  const removeLocality = (loc: string) => {
    setLocalities(localities.filter((l) => l !== loc));
  };

  const availableLocalities = (CITY_LOCALITIES[city] ?? []).filter(
    (l) => !localities.includes(l),
  );

  const shareMessage = `Hi ${linkName}! Your broker wants to onboard you into TrustKeyper. Please complete your tenant profile using this link: ${generatedLink}`;
  const encodedMsg = encodeURIComponent(shareMessage);

  const shareTargets = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "bg-emerald-50 text-emerald-600",
      href: `https://wa.me/${linkPhone.startsWith("+") ? linkPhone : "+91" + linkPhone}?text=${encodedMsg}`,
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      color: "bg-pink-50 text-pink-600",
      href: `https://www.instagram.com/direct/inbox/`, // Instagram doesn't support direct message pre-fill via URL easily
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: Send,
      color: "bg-sky-50 text-sky-600",
      href: `https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${encodedMsg}`,
    },
    {
      id: "sms",
      label: "SMS",
      icon: Smartphone,
      color: "bg-gray-100 text-gray-700",
      href: `sms:${linkPhone.startsWith("+") ? linkPhone : "+91" + linkPhone}?body=${encodedMsg}`,
    },
  ];

  return (
    <BrokerLayout>
      <div className="max-w-3xl mx-auto">
        {step === 1 ? (
          <Link
            href="/broker/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        ) : (
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add Tenant</h1>
          <button
            type="button"
            onClick={handleClearTenantForm}
            className="text-xs font-semibold text-primary border-0 bg-transparent shadow-none px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          >
            Clear
          </button>
        </div>

        {/* Generate Link card (always visible) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
              <Link2 size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Generate link</p>
              <p className="text-sm text-gray-500">
                Send onboarding link to tenant, they'll fill it themselves
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={openLinkModal}
            className="border-primary text-primary hover:bg-primary/5"
          >
            Generate Link
          </Button>
        </div>

        {step === 1 && (
          <>
            <div className="flex items-center gap-2 text-primary font-medium mb-4">
              <UserPlus size={16} />
              <span>Add Manually</span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="t-name" className="text-gray-700">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="t-name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-phone" className="text-gray-700">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 rounded-md border border-input bg-gray-50 text-sm text-gray-700"
                    >
                      🇮🇳 +91 <ChevronDown size={14} />
                    </button>
                    <Input
                      id="t-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <Label htmlFor="t-occ" className="text-gray-700">
                  Occupancy From <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="t-occ"
                  type="date"
                  value={occupancyFrom}
                  onChange={(e) => setOccupancyFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">
                  Who will be staying in the property?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Family", "Bachelor"] as const).map((opt) => {
                    const isActive = who === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setWho(opt);
                          if (opt === "Family") setIdentify([]);
                        }}
                        className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                          isActive
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {opt === "Family" ? "👨‍👩‍👧 Family" : "🧑 Bachelor"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {who === "Bachelor" && (
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    How do you identify?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-6">
                    {(["Male", "Female"] as const).map((opt) => (
                      <label
                        key={opt}
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={identify.includes(opt)}
                          onCheckedChange={() => toggleIdentify(opt)}
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-700">
                  Food Preference <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Veg", "Non-Veg"] as const).map((opt) => {
                    const isActive = food === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFood(opt)}
                        className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                          isActive
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {opt === "Veg" ? "🟢 Veg" : "🔴 Non-Veg"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 1 CTA — desktop */}
            <Button
              size="lg"
              onClick={handleStep1Continue}
              disabled={!step1Valid}
              className="hidden sm:flex w-full mt-8 bg-primary hover:bg-primary/90"
            >
              Continue <ArrowRight size={16} className="ml-1" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-2 text-primary font-medium mb-4">
              <MapPin size={16} />
              <span>Location & Property Preference</span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
              {/* Locality */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Area / Locality{" "}
                  <span className="text-gray-400 text-xs">(Upto 4)</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={city}
                    onValueChange={(v) => {
                      setCity(v);
                      setLocalities([]);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CITY_LOCALITIES).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 min-h-9 rounded-md border border-input bg-white px-2 py-1 flex flex-wrap gap-2 items-center">
                    {localities.map((l) => (
                      <span
                        key={l}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-primary text-xs"
                      >
                        {l}
                        <button
                          type="button"
                          onClick={() => removeLocality(l)}
                          className="hover:text-primary/70"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      list="locality-options"
                      value={localityInput}
                      onChange={(e) => setLocalityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLocality(localityInput.trim());
                        }
                      }}
                      onBlur={() =>
                        localityInput && addLocality(localityInput.trim())
                      }
                      placeholder={
                        localities.length >= 4
                          ? "Max 4 selected"
                          : "Type and press Enter"
                      }
                      disabled={localities.length >= 4}
                      className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
                    />
                    <datalist id="locality-options">
                      {availableLocalities.map((l) => (
                        <option key={l} value={l} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PROPERTY_TYPES.map((p) => {
                    const isActive = propertyType === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPropertyType(p)}
                        className={`py-2 rounded-md border text-sm font-medium transition-colors ${
                          isActive
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sharing */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Sharing Preferences{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SHARING_OPTIONS.map((s) => {
                    const isActive = sharing === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSharing(s);
                          if (s === "Entire Property") setRoommate([]);
                        }}
                        className={`py-2 rounded-md border text-sm font-medium transition-colors ${
                          isActive
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {s === "Entire Property"
                          ? "Entire Property (No sharing)"
                          : s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roommate preferences */}
              {sharing && sharing !== "Entire Property" && (
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Roommate preferences{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-6 flex-wrap">
                    {(
                      [
                        { v: "Male", label: "Male" },
                        { v: "Female", label: "Female" },
                        { v: "Anyone", label: "Anyone (No Preference)" },
                      ] as { v: Roommate; label: string }[]
                    ).map((opt) => (
                      <label
                        key={opt.v}
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={roommate.includes(opt.v)}
                          onCheckedChange={() => toggleRoommate(opt.v)}
                        />
                        <span className="text-sm text-gray-700">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 CTA — desktop */}
            <div className="hidden sm:flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleSkipSave}
                className="border-primary text-primary hover:bg-primary/5"
              >
                Skip and Save details
              </Button>
              <Button
                onClick={handleSaveDetails}
                disabled={!step2Valid}
                className="bg-primary hover:bg-primary/90"
              >
                Save Details
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Mobile sticky CTAs */}
      {step === 1 && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white border-t border-gray-200 px-4 py-3">
          <button
            onClick={handleStep1Continue}
            disabled={!step1Valid}
            className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold transition-colors ${
              step1Valid ? "bg-primary text-white" : "bg-primary/40 text-white cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <button
            onClick={handleSkipSave}
            className="flex-1 h-12 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSaveDetails}
            disabled={!step2Valid}
            className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${
              step2Valid ? "bg-primary text-white" : "bg-primary/40 text-white cursor-not-allowed"
            }`}
          >
            Save Details
          </button>
        </div>
      )}

      {/* Generate Link modal */}
      <Dialog
        open={modalStep !== "closed"}
        onOpenChange={(o) => !o && setModalStep("closed")}
      >
        <DialogContent className="sm:max-w-md p-0 [&>button]:hidden">
          {modalStep === "form" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Send Onboarding Link
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter tenant's basic details to generate a personalized link
                  </p>
                </div>
                <button
                  onClick={() => setModalStep("closed")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="modal-name" className="text-gray-700">
                    Tenant Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-name"
                    placeholder="Enter name"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-phone" className="text-gray-700">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 rounded-md border border-input bg-gray-50 text-sm text-gray-700"
                    >
                      +91… <ChevronDown size={14} />
                    </button>
                    <Input
                      id="modal-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={linkPhone}
                      onChange={(e) =>
                        setLinkPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleGenerateLink}
                disabled={!linkValid}
                className="w-full mt-8 bg-primary hover:bg-primary/90"
              >
                <Link2 size={16} className="mr-2" /> Generate Link
              </Button>
            </div>
          )}

          {modalStep === "share" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Share link with {linkName}
                </h2>
                <button
                  onClick={() => setModalStep("closed")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">Share this link via</p>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {shareTargets.map((t) => {
                  const Icon = t.icon;
                  return (
                    <a
                      key={t.id}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${t.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">{t.label}</span>
                    </a>
                  );
                })}
              </div>

              <Label className="text-gray-700 text-sm">Page link</Label>
              <div className="flex items-center gap-2 mt-2 mb-6">
                <Input
                  readOnly
                  value={generatedLink}
                  className="bg-gray-50 text-sm flex-1"
                />
                <button
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-md border border-input flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  {copied ? (
                    <Check size={16} className="text-accent" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <Button
                size="lg"
                onClick={() => {
                  setModalStep("closed");
                  setLocation("/broker/tenants");
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Check size={16} className="mr-2" /> Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success modal */}
      <Dialog
        open={successOpen}
        onOpenChange={(o) => {
          setSuccessOpen(o);
          if (!o) setLocation("/broker/tenants");
        }}
      >
        <DialogContent className="sm:max-w-md p-0 [&>button]:hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/15 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Tenant Profile Created!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              The tenant details have been saved successfully.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessOpen(false);
                  setLocation("/broker/tenants");
                }}
                className="border-primary text-primary hover:bg-primary/5"
              >
                Skip for now
              </Button>
              <Button
                onClick={() => {
                  setSuccessOpen(false);
                  setLocation("/broker/agreements/generate");
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <FileText size={16} className="mr-2" />
                Generate Agreement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BrokerLayout>
  );
}
