import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Home,
  Wallet,
  ImageIcon,
  X,
  Check,
  Plus,
  ChevronDown,
  ChevronLeft,
  User,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";
import { addProperty } from "@/lib/properties";
import { CITY_LOCALITIES } from "@/lib/tenants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ─── Constants ───────────────────────────────────────────────────────────────
const PROPERTY_TYPES = ["Apartment", "House", "Studio", "Villa", "Other"];
const UNIT_SIZES = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Other"];
const FURNISHING_OPTIONS = ["Unfurnished", "Semi Furnished", "Fully Furnished"];
const UNIT_OPTIONS = ["sq ft", "sq m", "sq yards"];
const FLOORS_OPTIONS = Array.from({ length: 30 }, (_, i) => String(i + 1));
const BEDROOM_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const BATHROOM_OPTIONS = Array.from({ length: 8 }, (_, i) => String(i + 1));
const BALCONY_OPTIONS = ["0", "1", "2", "3", "4", "5+"];
const FLOOR_LEVEL_OPTIONS = [
  "Ground",
  ...Array.from({ length: 20 }, (_, i) => `${i + 1}${["st","nd","rd"][i] ?? "th"}`),
  "Penthouse",
];
const DIRECTION_OPTIONS = [
  "North", "South", "East", "West",
  "North-East", "North-West", "South-East", "South-West",
];
const COUNTRIES = ["India"];
const CITIES = Object.keys(CITY_LOCALITIES);

const AMENITIES_LEFT = [
  "Sport Club", "Gym", "Store Room", "Parking Space", "Pool",
  "Power Backup", "Alarm System", "Refrigerator", "Covered Car Parking Space",
];
const AMENITIES_RIGHT = [
  "Pooja Room", "Study Room", "Servant Room", "Garden", "Pets Allowed",
  "Air Conditioning", "Basketball Court", "Spa", "Uncovered Car Parking Space",
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ subStep }: { subStep: number }) {
  const steps = [
    { label: "Property Details", Icon: Home },
    { label: "Rental Details", Icon: Wallet },
    { label: "Upload Image", Icon: ImageIcon },
  ];

  const majorStep = subStep <= 3 ? 0 : subStep === 4 ? 1 : 2;

  const lineFill = (i: number): number => {
    if (i === 0) {
      if (subStep >= 4) return 100;
      return (subStep / 4) * 100;
    }
    if (i === 1) {
      return subStep >= 5 ? 100 : 0;
    }
    return 0;
  };

  return (
    <div className="flex items-start justify-center gap-0 mb-8 pt-8 px-4 w-full max-w-3xl mx-auto">
      {steps.map((s, i) => {
        const done = majorStep > i;
        const active = majorStep === i;
        const Icon = s.Icon;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center w-28 md:w-32 shrink-0">
              <Icon
                size={22}
                className={active || done ? "text-primary mb-1" : "text-gray-400 mb-1"}
              />
              <span
                className={`text-[10px] md:text-[11px] font-medium mb-2 text-center leading-tight ${
                  active || done ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors z-10 ${
                  done || active
                    ? "bg-primary text-white ring-4 ring-[#F5F7FA]"
                    : "bg-white border-2 border-gray-300 text-gray-400 ring-4 ring-[#F5F7FA]"
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mt-[52px] -mx-4 md:-mx-2 bg-gray-200 h-[2px] relative rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${lineFill(i)}%` }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Reusable UI Pieces ────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-gray-700 ml-0.5">*</span>}
    </label>
  );
}

function SelectField({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-900 appearance-none focus:outline-none focus:border-primary/50"
      >
        {placeholder && <option value="" disabled className="text-gray-400">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function ChipButton({
  label, selected, onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2.5 rounded-sm border text-sm transition-colors ${
        selected
          ? "bg-[#E8F5EE] border-accent text-gray-800"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function AmenityCheck({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none py-1" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-primary border-primary" : "bg-white border-gray-400 hover:border-primary/50"
      }`}>
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </div>
      <span className="text-[13px] text-gray-600">{label}</span>
    </label>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OwnerAddProperty() {
  const [, setLocation] = useLocation();
  const [subStep, setSubStep] = useState(0);

  // Sub-step 0 – Property Details
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");

  // Sub-step 1 – Type/Size/Furnishing
  const [propertyType, setPropertyType] = useState("");
  const [propertyTypeOther, setPropertyTypeOther] = useState("");
  const [unitSize, setUnitSize] = useState("");
  const [unitSizeOther, setUnitSizeOther] = useState("");
  const [furnishing, setFurnishing] = useState("");

  // Sub-step 2 – Dimensions
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [builtUpUnits, setBuiltUpUnits] = useState("sq ft");
  const [totalFloors, setTotalFloors] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [balconies, setBalconies] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [mainDoorDirection, setMainDoorDirection] = useState("");

  // Sub-step 3 – Amenities
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");

  // Sub-step 4 – Rental Details
  const [tenantsPreferred, setTenantsPreferred] = useState<string[]>([]);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [rentNegotiable, setRentNegotiable] = useState(false);
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(false);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");

  // Sub-step 5 – Images & Success
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isManagedPopupOpen, setIsManagedPopupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialization
  useEffect(() => {
    // Pre-fill owner details from onboarding if available
    const storedName = sessionStorage.getItem("owner_name");
    const storedContact = sessionStorage.getItem("owner_contact");
    if (storedName) setOwnerName(storedName);
    if (storedContact) setOwnerContact(storedContact);
  }, []);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  const toggleTenant = (t: string) =>
    setTenantsPreferred((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - imageUrls.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) setImageUrls((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  }, [imageUrls]);

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValidContact = (v: string): boolean => {
    if (!v.trim()) return false;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const phoneOk = /^\+?[\d\s\-().]{7,15}$/.test(v.trim());
    return emailOk || phoneOk;
  };

  const contactTouched = ownerContact.length > 0;
  const contactError = contactTouched && !isValidContact(ownerContact);

  const canContinue = (): boolean => {
    if (subStep === 0) {
      return !!(address && area && city && pincode && country && isValidContact(ownerContact));
    }
    if (subStep === 1) {
      const typeOk = propertyType !== "" && (propertyType !== "Other" || propertyTypeOther.trim() !== "");
      const sizeOk = unitSize !== "" && (unitSize !== "Other" || unitSizeOther.trim() !== "");
      return typeOk && sizeOk && furnishing !== "";
    }
    if (subStep === 2) {
      return !!(builtUpArea && builtUpUnits && totalFloors && bedrooms && bathrooms && balconies && floorLevel && mainDoorDirection);
    }
    if (subStep === 3) return true; // Amenities optional
    if (subStep === 4) {
      return tenantsPreferred.length > 0 && !!monthlyRent && !!securityDeposit && !!availableFrom;
    }
    return imageUrls.length > 0;
  };

  const handleSubmit = () => {
    addProperty({
      nickname, address, area, city, pincode, country,
      ownerName, ownerContact,
      propertyType, propertyTypeOther, unitSize, unitSizeOther, furnishing,
      builtUpArea, builtUpUnits, totalFloors, bedrooms, bathrooms, balconies, floorLevel, mainDoorDirection,
      amenities: amenities.includes("Other") && customAmenity.trim() ? [...amenities.filter(a => a !== "Other"), customAmenity.trim()] : amenities,
      tenantsPreferred, monthlyRent, rentNegotiable, maintenanceIncluded, monthlyMaintenance, securityDeposit, availableFrom,
      images: imageUrls, imageCount: imageUrls.length, status: "Active",
      uploadedBy: "owner",
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setLocation("/owner/dashboard");
    }, 2000);
  };

  const handleContinue = () => {
    if (subStep < 5) {
      setSubStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  // ─── Render Sub-Steps ────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <FieldLabel required>Your Email ID</FieldLabel>
          <Input value={ownerContact.includes("@") ? ownerContact : "meena@trustkeyper.com"} disabled className="bg-[#D1DAE8] border-none text-gray-500 h-10 rounded-sm" />
        </div>
        <div>
          <FieldLabel required>Phone Number</FieldLabel>
          <div className="flex bg-[#F5F7FA] border border-gray-200 rounded-sm overflow-hidden h-10">
            <div className="flex items-center gap-1.5 px-3 bg-white border-r border-gray-200">
              <span className="text-sm">🇮🇳</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <Input value={!ownerContact.includes("@") ? ownerContact : "+91 6369856040"} disabled className="border-none bg-transparent h-full" />
          </div>
        </div>
      </div>

      <div className="mt-8 mb-6 text-center">
        <h2 className="text-2xl font-medium text-gray-800">Property details</h2>
      </div>

      <div className="space-y-5">
        <div>
          <FieldLabel>Property Nickname</FieldLabel>
          <Input placeholder="Type here" value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
        </div>
        <div>
          <FieldLabel required>Address</FieldLabel>
          <Input placeholder="Type here" value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <FieldLabel required>Area/Landmark</FieldLabel>
            <Input placeholder="Type here" value={area} onChange={(e) => setArea(e.target.value)} className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
          </div>
          <div>
            <FieldLabel required>City</FieldLabel>
            <SelectField value={city} onChange={setCity} options={CITIES} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <FieldLabel required>Pincode</FieldLabel>
            <Input placeholder="Type here" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
          </div>
          <div>
            <FieldLabel required>Country</FieldLabel>
            <SelectField value={country} onChange={setCountry} options={COUNTRIES} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 text-center border-b pb-6">
        <h2 className="text-[22px] font-medium text-gray-800 mb-1">Tell us more about your property</h2>
        <p className="text-[13px] text-gray-400">Providing these details will boost your chances of finding a tenant</p>
      </div>
      <div className="space-y-7">
        <div>
          <FieldLabel>Property Type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <ChipButton key={t} label={t} selected={propertyType === t} onClick={() => { setPropertyType(t); if (t !== "Other") setPropertyTypeOther(""); }} />
            ))}
          </div>
          {propertyType === "Other" && (
            <div className="mt-3"><Input placeholder="Type here" value={propertyTypeOther} onChange={(e) => setPropertyTypeOther(e.target.value)} className="h-10 rounded-sm" /></div>
          )}
        </div>

        <div>
          <FieldLabel>Unit Size</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {UNIT_SIZES.map((s) => (
              <ChipButton key={s} label={s} selected={unitSize === s} onClick={() => { setUnitSize(s); if (s !== "Other") setUnitSizeOther(""); }} />
            ))}
          </div>
          {unitSize === "Other" && (
            <div className="mt-3"><Input placeholder="Type here" value={unitSizeOther} onChange={(e) => setUnitSizeOther(e.target.value)} className="h-10 rounded-sm" /></div>
          )}
        </div>

        <div>
          <FieldLabel>Furnishing Status</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {FURNISHING_OPTIONS.map((f) => (
              <ChipButton key={f} label={f} selected={furnishing === f} onClick={() => setFurnishing(f)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 text-center border-b pb-6">
        <h2 className="text-[22px] font-medium text-gray-800 mb-1">Tell us more about your property</h2>
        <p className="text-[13px] text-gray-400">Providing these details will boost your chances of finding a tenant</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <FieldLabel>Built Up Area</FieldLabel>
          <Input placeholder="Type here" value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value)} type="number" className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
        </div>
        <div>
          <FieldLabel required>Units</FieldLabel>
          <SelectField value={builtUpUnits} onChange={setBuiltUpUnits} options={UNIT_OPTIONS} placeholder="Select" />
        </div>
        <div>
          <FieldLabel required>Total Floors</FieldLabel>
          <SelectField value={totalFloors} onChange={setTotalFloors} options={FLOORS_OPTIONS} placeholder="Select" />
        </div>
        <div>
          <FieldLabel required>Bedrooms</FieldLabel>
          <SelectField value={bedrooms} onChange={setBedrooms} options={BEDROOM_OPTIONS} placeholder="Select" />
        </div>
        <div>
          <FieldLabel required>Bathrooms</FieldLabel>
          <SelectField value={bathrooms} onChange={setBathrooms} options={BATHROOM_OPTIONS} placeholder="Select" />
        </div>
        <div>
          <FieldLabel required>Balconies</FieldLabel>
          <SelectField value={balconies} onChange={setBalconies} options={BALCONY_OPTIONS} placeholder="Select" />
        </div>
        <div>
          <FieldLabel required>Floor Level</FieldLabel>
          <Input placeholder="Type here" value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} type="number" className="h-10 rounded-sm border-gray-200 focus:border-primary/50" />
        </div>
        <div>
          <FieldLabel required>Direction of main door</FieldLabel>
          <SelectField value={mainDoorDirection} onChange={setMainDoorDirection} options={DIRECTION_OPTIONS} placeholder="Select" />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 text-center border-b pb-6">
        <h2 className="text-[22px] font-medium text-gray-800 mb-1">Tell us more about your property</h2>
        <p className="text-[13px] text-gray-400">Providing these details will boost your chances of finding a tenant</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 max-w-lg mx-auto">
        <div className="space-y-4">
          {AMENITIES_LEFT.map((a) => (
            <AmenityCheck key={a} label={a} checked={amenities.includes(a)} onChange={(v) => toggleAmenity(a)} />
          ))}
        </div>
        <div className="space-y-4">
          {AMENITIES_RIGHT.map((a) => (
            <AmenityCheck key={a} label={a} checked={amenities.includes(a)} onChange={(v) => toggleAmenity(a)} />
          ))}
          <AmenityCheck label="Other" checked={amenities.includes("Other")} onChange={(v) => toggleAmenity("Other")} />
          {amenities.includes("Other") && (
            <div className="mt-2 pl-7">
              <Input placeholder="Specify other amenities" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} className="h-9 rounded-sm text-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 text-center border-b pb-6">
        <h2 className="text-[22px] font-medium text-gray-800 mb-1">Rental details for your property</h2>
      </div>
      <div className="space-y-6">
        <div>
          <FieldLabel required>Tenants Preferred</FieldLabel>
          <div className="flex items-center gap-6 flex-wrap mt-2">
            {["Family", "Bachelors - Male", "Bachelors - Female"].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); toggleTenant(t); }}>
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                  tenantsPreferred.includes(t) ? "bg-primary border-primary" : "bg-white border-gray-400 hover:border-primary/50"
                }`}>
                  {tenantsPreferred.includes(t) && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
                <span className="text-[13px] text-gray-600">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel required>Expected Monthly Rent</FieldLabel>
          <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden w-full sm:w-[calc(50%-12px)]">
            <span className="px-3 text-sm text-gray-500 border-r border-gray-200 bg-gray-50 h-10 flex items-center">₹</span>
            <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="flex-1 h-10 px-3 text-sm focus:outline-none bg-white w-full" placeholder="Type here" />
            <span className="px-3 text-sm text-gray-500 border-l border-gray-200 bg-gray-50 h-10 flex items-center whitespace-nowrap">/month</span>
          </div>
        </div>

        <div className="flex items-center gap-6 pb-2">
          <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); setRentNegotiable(!rentNegotiable); }}>
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${rentNegotiable ? "bg-primary border-primary" : "bg-white border-gray-400 hover:border-primary/50"}`}>
              {rentNegotiable && <Check size={12} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[13px] text-gray-600">Rent Negotiable</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); setMaintenanceIncluded(!maintenanceIncluded); if (!maintenanceIncluded) setMonthlyMaintenance(""); }}>
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${maintenanceIncluded ? "bg-primary border-primary" : "bg-white border-gray-400 hover:border-primary/50"}`}>
              {maintenanceIncluded && <Check size={12} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[13px] text-gray-600">Maintenance included</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <FieldLabel>Monthly Maintenance Amount</FieldLabel>
            <div className={`flex items-center border rounded-sm overflow-hidden transition-opacity ${maintenanceIncluded ? "opacity-40 pointer-events-none border-gray-200 bg-gray-50" : "border-gray-200"}`}>
              <span className="px-3 text-sm text-gray-500 border-r border-gray-200 bg-gray-50 h-10 flex items-center">₹</span>
              <input type="number" value={monthlyMaintenance} onChange={(e) => setMonthlyMaintenance(e.target.value)} disabled={maintenanceIncluded} placeholder="Type here" className="flex-1 h-10 px-3 text-sm focus:outline-none bg-transparent disabled:bg-transparent w-full" />
            </div>
          </div>
          <div>
            <FieldLabel required>Expected Security Deposit</FieldLabel>
            <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
              <span className="px-3 text-sm text-gray-500 border-r border-gray-200 bg-gray-50 h-10 flex items-center">₹</span>
              <input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="Type here" className="flex-1 h-10 px-3 text-sm focus:outline-none bg-white w-full" />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel required>Available From *</FieldLabel>
          <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden sm:w-[200px]">
            <span className="px-3 text-gray-400 h-10 flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className="flex-1 h-10 px-2 text-[13px] text-gray-600 focus:outline-none bg-white w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 text-center border-b pb-6">
        <h2 className="text-[22px] font-medium text-gray-800 mb-1">Upload property images</h2>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Guidelines</p>
          <p className="text-xs text-gray-600 mb-3">
            Our AI system automatically checks every photo for clarity, lighting, and relevance.
          </p>
          <ul className="space-y-1">
            {["Minimum 1 photos, maximum 5", "Show all rooms clearly with good lighting (daylight preferred)", "Clear and in focus"].map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-gray-600">
                <Check size={12} className="text-green-600 mt-0.5 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        {imageUrls.length === 0 ? (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-primary/40 rounded-xl bg-blue-50/40 flex flex-col items-center justify-center py-10 gap-3 hover:bg-blue-50 transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
            <ImageIcon size={32} className="text-primary" />
            <p className="text-sm text-gray-700">Drag a <span className="text-primary font-medium">Image</span> to Upload</p>
            <Button size="sm" variant="outline" className="border-primary text-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select photos</Button>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {imageUrls.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-primary/40 rounded-lg bg-blue-50/40 flex items-center justify-center hover:bg-blue-50 transition-colors"><Plus size={24} className="text-primary" /></button>
            )}
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      
      {/* Top Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 z-10 relative">
        <button onClick={() => { if (subStep > 0) { setSubStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } else { setLocation("/"); } }} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors font-medium">
          <ChevronLeft size={16} /> Go back
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
          <User size={16} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-32">
        <ProgressBar subStep={subStep} />

        <div className="bg-white rounded-lg shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-8 md:p-14 mx-auto max-w-[850px] mb-8">
          {subStep === 0 && renderStep0()}
          {subStep === 1 && renderStep1()}
          {subStep === 2 && renderStep2()}
          {subStep === 3 && renderStep3()}
          {subStep === 4 && renderStep4()}
          {subStep === 5 && renderStep5()}

          {/* Desktop Continue */}
          <div className="mt-10 hidden sm:flex justify-center mb-10">
            <Button size="lg" onClick={handleContinue} disabled={!canContinue()} className="w-32 bg-primary hover:bg-primary/90 rounded-sm">
              {subStep === 5 ? "Submit" : "Continue \u2192"}
            </Button>
          </div>

          {/* Let us help you Banner */}
          <div className="w-full bg-white rounded-md border border-gray-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                <PhoneCall size={18} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Don't want to fill all the details? Let us help you!</p>
                <p className="text-[11px] text-gray-500">Our Manager will help you out</p>
              </div>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-blue-50 text-xs px-6 h-8 rounded-sm" onClick={() => setIsManagedPopupOpen(true)}>
              I'm interested
            </Button>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Continue */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button size="lg" onClick={handleContinue} disabled={!canContinue()} className="w-full bg-primary hover:bg-primary/90 rounded-sm">
          {subStep === 5 ? "Submit" : "Continue \u2192"}
        </Button>
      </div>

      <Footer />

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center p-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <Check size={28} className="text-green-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-gray-900">Successfully Verified!</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">Property details have been saved</DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Manager Popup */}
      <Dialog open={isManagedPopupOpen} onOpenChange={setIsManagedPopupOpen}>
        <DialogContent className="sm:max-w-md text-center p-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary">
            <PhoneCall size={24} />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">We're on it!</DialogTitle>
          <DialogDescription className="text-center text-base mt-3 text-gray-600">
            {ownerContact.includes("@") 
              ? "Thank you for showing interest. You will receive a meeting link at your registered email address shortly to discuss your property."
              : "Thank you for showing interest. Our expert property manager will contact you at your registered mobile number shortly."}
          </DialogDescription>
          <div className="mt-8 w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm" onClick={() => { setIsManagedPopupOpen(false); }}>
              Okay, got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
