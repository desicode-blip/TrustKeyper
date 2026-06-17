import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft, Loader2, User, X } from "lucide-react";
import { FlowChipButton } from "@/components/FlowChipButton";
import { FlowDateInput } from "@/components/flow/FlowDateInput";
import { TrustKeyperFooter } from "@/components/TrustKeyperFooter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";
import { todayLocalDateInputMin } from "@/lib/dateInput";
import {
  submitTenantOnboardRequirements,
  type TenantOnboardSubmitPayload,
} from "@/lib/publicBrokerTenantOnboard";
import {
  getTenantOnboardDraft,
  setTenantOnboardDraft,
  type TenantBrokerOnboardSession,
} from "@/lib/tenantBrokerOnboardSession";
import {
  CITY_LOCALITIES,
  type Identify,
  type PropertyType,
  type Roommate,
  type Sharing,
} from "@/lib/tenants";
import { cn } from "@/lib/utils";

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

type DraftShape = {
  step: Step;
  linkedinUrl: string;
  occupancyFrom: string;
  who: "Family" | "Bachelor" | "";
  identify: Identify[];
  food: "Veg" | "Non-Veg" | "";
  city: string;
  localities: string[];
  propertyType: PropertyType | "";
  sharing: Sharing | "";
  roommate: Roommate[];
};

export function TenantOnboardRequirementFlow({
  session,
  onDone,
}: {
  session: TenantBrokerOnboardSession;
  onDone: () => void;
}) {
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [occupancyFrom, setOccupancyFrom] = useState("");
  const [who, setWho] = useState<"Family" | "Bachelor" | "">("");
  const [identify, setIdentify] = useState<Identify[]>([]);
  const [food, setFood] = useState<"Veg" | "Non-Veg" | "">("");
  const [city, setCity] = useState("Hyderabad");
  const [localities, setLocalities] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [sharing, setSharing] = useState<Sharing | "">("");
  const [roommate, setRoommate] = useState<Roommate[]>([]);
  const [localityInput, setLocalityInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [brokerName, setBrokerName] = useState(session.brokerName);

  const phoneDigits = session.phone.replace(/\D/g, "").slice(-10);

  useEffect(() => {
    const draft = getTenantOnboardDraft<DraftShape>(session.token);
    if (!draft) return;
    if (draft.step === 1 || draft.step === 2) setStep(draft.step);
    if (typeof draft.linkedinUrl === "string") setLinkedinUrl(draft.linkedinUrl);
    if (typeof draft.occupancyFrom === "string") setOccupancyFrom(draft.occupancyFrom);
    if (draft.who === "Family" || draft.who === "Bachelor") setWho(draft.who);
    if (Array.isArray(draft.identify)) setIdentify(draft.identify);
    if (draft.food === "Veg" || draft.food === "Non-Veg") setFood(draft.food);
    if (typeof draft.city === "string") setCity(draft.city);
    if (Array.isArray(draft.localities)) setLocalities(draft.localities);
    if (draft.propertyType) setPropertyType(draft.propertyType);
    if (draft.sharing) setSharing(draft.sharing);
    if (Array.isArray(draft.roommate)) setRoommate(draft.roommate);
  }, [session.token]);

  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      setTenantOnboardDraft(session.token, {
        step,
        linkedinUrl,
        occupancyFrom,
        who,
        identify,
        food,
        city,
        localities,
        propertyType,
        sharing,
        roommate,
      });
    }, 400);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [
    session.token,
    step,
    linkedinUrl,
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

  const step1Valid = useMemo(() => {
    if (!linkedinUrl.trim() || !occupancyFrom || !who || !food) return false;
    if (who === "Bachelor" && identify.length === 0) return false;
    return true;
  }, [linkedinUrl, occupancyFrom, who, identify, food]);

  const step2Valid = useMemo(() => {
    if (localities.length === 0 || !propertyType || !sharing) return false;
    if (sharing !== "Entire Property" && roommate.length === 0) return false;
    return true;
  }, [localities, propertyType, sharing, roommate]);

  const toggleIdentify = (v: Identify) => {
    setIdentify((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const toggleRoommate = (v: Roommate) => {
    setRoommate((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const addLocality = (loc: string) => {
    if (!loc || localities.includes(loc) || localities.length >= 4) return;
    setLocalities([...localities, loc]);
    setLocalityInput("");
  };

  const removeLocality = (loc: string) => {
    setLocalities(localities.filter((l) => l !== loc));
  };

  const availableLocalities = (CITY_LOCALITIES[city] ?? []).filter((l) => !localities.includes(l));

  const buildPayload = (detailsComplete: boolean): TenantOnboardSubmitPayload => ({
    name: session.name.trim(),
    phone: `+91${phoneDigits}`,
    linkedinUrl: linkedinUrl.trim(),
    occupancyFrom,
    who: who as "Family" | "Bachelor",
    identify: who === "Bachelor" ? identify : undefined,
    food: food as "Veg" | "Non-Veg",
    city: detailsComplete ? city : undefined,
    localities: detailsComplete ? localities : undefined,
    propertyType: detailsComplete ? propertyType : undefined,
    sharing: detailsComplete ? sharing : undefined,
    roommate:
      detailsComplete && sharing !== "Entire Property" ? roommate : undefined,
    detailsComplete,
  });

  const handleSubmit = async (detailsComplete: boolean) => {
    if (detailsComplete && !step2Valid) return;
    if (!step1Valid) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitTenantOnboardRequirements(
        session.token,
        buildPayload(detailsComplete),
      );
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setBrokerName(result.brokerName);
      setSuccessOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (successOpen) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center animate-in zoom-in-95 fade-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Requirements Submitted Successfully
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your rental requirements have been shared with your broker
              {brokerName ? ` (${brokerName})` : ""}. You will be contacted shortly with
              properties that best match your needs.
            </p>
            <Button type="button" className={authPrimaryButtonClass} onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
        <TrustKeyperFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        {step === 1 ? (
          <span className="inline-flex items-center gap-2 text-sm text-gray-400">
            <ChevronLeft size={16} /> Go back
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={16} /> Go back
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <User size={18} />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                step >= 1 ? "bg-primary" : "bg-gray-200",
              )}
            />
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                step >= 2 ? "bg-primary" : "bg-gray-200",
              )}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
              {step === 1
                ? "Tell us a bit about yourself"
                : "Tell us more about what you are looking for"}
            </h1>

            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Your Name</Label>
                  <Input value={session.name} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 flex items-center">
                      🇮🇳 +91
                    </div>
                    <Input value={phoneDigits} readOnly className="bg-gray-50 flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboard-linkedin" className="text-gray-700">
                    LinkedIn Profile <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="onboard-linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboard-occ" className="text-gray-700">
                    Occupancy From <span className="text-destructive">*</span>
                  </Label>
                  <FlowDateInput
                    id="onboard-occ"
                    min={todayLocalDateInputMin()}
                    value={occupancyFrom}
                    onChange={setOccupancyFrom}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Who will be staying in the property?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["Family", "Bachelor"] as const).map((opt) => (
                      <FlowChipButton
                        key={opt}
                        label={opt === "Family" ? "👨‍👩‍👧 Family" : "🧑 Bachelor"}
                        selected={who === opt}
                        onClick={() => {
                          setWho(opt);
                          if (opt === "Family") setIdentify([]);
                        }}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
                {who === "Bachelor" ? (
                  <div className="space-y-2">
                    <Label className="text-gray-700">
                      How do you identify? <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-6">
                      {(["Male", "Female"] as const).map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={identify.includes(opt)}
                            onCheckedChange={() => toggleIdentify(opt)}
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Food Preference <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["Veg", "Non-Veg"] as const).map((opt) => (
                      <FlowChipButton
                        key={opt}
                        label={opt === "Veg" ? "🥦 Veg" : "🍗 Non-Veg"}
                        selected={food === opt}
                        onClick={() => setFood(opt)}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    className={authPrimaryButtonClass}
                    disabled={!step1Valid}
                    onClick={() => setStep(2)}
                  >
                    Continue <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Area / Locality <span className="text-gray-400 text-xs">(Upto 4)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={city}
                      onValueChange={(v) => {
                        setCity(v);
                        setLocalities([]);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-36">
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
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-primary text-xs border border-blue-100"
                        >
                          {l}
                          <button type="button" onClick={() => removeLocality(l)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        list="tenant-onboard-localities"
                        value={localityInput}
                        onChange={(e) => setLocalityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLocality(localityInput.trim());
                          }
                        }}
                        onBlur={() => localityInput && addLocality(localityInput.trim())}
                        placeholder={
                          localities.length >= 4 ? "Max 4 selected" : "Type and press Enter"
                        }
                        disabled={localities.length >= 4}
                        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none"
                      />
                      <datalist id="tenant-onboard-localities">
                        {availableLocalities.map((l) => (
                          <option key={l} value={l} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    What type of property are you looking for?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map((p) => (
                      <FlowChipButton
                        key={p}
                        label={p}
                        selected={propertyType === p}
                        onClick={() => setPropertyType(p)}
                        className="text-xs sm:text-sm"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    What type of sharing do you prefer?{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHARING_OPTIONS.map((s) => (
                      <FlowChipButton
                        key={s}
                        label={s === "Entire Property" ? "Entire Property (No sharing)" : s}
                        selected={sharing === s}
                        onClick={() => {
                          setSharing(s);
                          if (s === "Entire Property") setRoommate([]);
                        }}
                        className="text-xs sm:text-sm whitespace-normal h-auto min-h-[42px]"
                      />
                    ))}
                  </div>
                </div>
                {sharing && sharing !== "Entire Property" ? (
                  <div className="space-y-2">
                    <Label className="text-gray-700">
                      How do you identify? <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      {(["Male", "Female", "Anyone"] as const).map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={roommate.includes(opt)}
                            onCheckedChange={() => toggleRoommate(opt)}
                          />
                          <span className="text-sm text-gray-700">
                            {opt === "Anyone" ? "Anyone (No Preference)" : opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
                {submitError ? (
                  <p className="text-sm text-destructive text-center">{submitError}</p>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[4px] border-primary text-primary font-semibold"
                    disabled={submitting || !step1Valid}
                    onClick={() => void handleSubmit(false)}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Skip and share details
                  </Button>
                  <Button
                    type="button"
                    className={authPrimaryButtonClass}
                    disabled={!step2Valid || submitting}
                    onClick={() => void handleSubmit(true)}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" /> Sharing…
                      </>
                    ) : (
                      "Share Details"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <TrustKeyperFooter />
    </div>
  );
}
