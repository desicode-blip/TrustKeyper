import React, { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Home,
  Wallet,
  ImageIcon,
  X,
  Check,
  Plus,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrokerLayout from "@/components/BrokerLayout";
import { addProperty } from "@/lib/properties";
import { CITY_LOCALITIES } from "@/lib/tenants";

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

  // majorStep: 0 = sub-steps 0–3, 1 = sub-step 4, 2 = sub-step 5
  const majorStep = subStep <= 3 ? 0 : subStep === 4 ? 1 : 2;

  // Percentage fill for the connecting line between step i and i+1
  const lineFill = (i: number): number => {
    if (i === 0) {
      // Line between Property Details and Rental Details
      // Sub-steps 0–3 fill 0→25→50→75%, sub-step 4+ = 100%
      if (subStep >= 4) return 100;
      return (subStep / 4) * 100;
    }
    if (i === 1) {
      // Line between Rental Details and Upload Image
      return subStep >= 5 ? 100 : 0;
    }
    return 0;
  };

  return (
    <div className="flex items-start justify-center gap-0 mb-6">
      {steps.map((s, i) => {
        const done = majorStep > i;
        const active = majorStep === i;
        const Icon = s.Icon;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center w-32">
              <Icon
                size={22}
                className={active || done ? "text-primary mb-1" : "text-gray-400 mb-1"}
              />
              <span
                className={`text-[11px] font-medium mb-2 text-center leading-tight ${
                  active || done ? "text-primary" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  done || active
                    ? "bg-primary text-white"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mt-12 mx-1 bg-gray-200 h-0.5 relative overflow-hidden rounded-full">
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
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
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
        className="w-full h-9 rounded-md border border-input bg-white px-3 pr-8 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
        selected
          ? "bg-primary/10 border-primary text-primary"
          : "bg-white border-gray-300 text-gray-700 hover:border-primary/50"
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
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary accent-primary"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AddProperty() {
  const [, setLocation] = useLocation();
  const STORAGE_KEY = "broker_add_property_data";

  const loadSavedData = () => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      return null;
    }
  };
  const savedData = loadSavedData();
  const [subStep, setSubStep] = useState(savedData?.subStep ?? 0);

  // Sub-step 0 – Property Details
  const [nickname, setNickname] = useState(savedData?.nickname ?? "");
  const [address, setAddress] = useState(savedData?.address ?? "");
  const [area, setArea] = useState(savedData?.area ?? "");
  const [city, setCity] = useState(savedData?.city ?? "");
  const [pincode, setPincode] = useState(savedData?.pincode ?? "");
  const [country, setCountry] = useState(savedData?.country ?? "India");
  const [ownerName, setOwnerName] = useState(savedData?.ownerName ?? "");
  const [ownerContact, setOwnerContact] = useState(savedData?.ownerContact ?? "");

  // Sub-step 1 – Type/Size/Furnishing
  const [propertyType, setPropertyType] = useState(savedData?.propertyType ?? "");
  const [propertyTypeOther, setPropertyTypeOther] = useState(savedData?.propertyTypeOther ?? "");
  const [unitSize, setUnitSize] = useState(savedData?.unitSize ?? "");
  const [unitSizeOther, setUnitSizeOther] = useState(savedData?.unitSizeOther ?? "");
  const [furnishing, setFurnishing] = useState(savedData?.furnishing ?? "");

  // Sub-step 2 – Dimensions
  const [builtUpArea, setBuiltUpArea] = useState(savedData?.builtUpArea ?? "");
  const [builtUpUnits, setBuiltUpUnits] = useState(savedData?.builtUpUnits ?? "sq ft");
  const [totalFloors, setTotalFloors] = useState(savedData?.totalFloors ?? "");
  const [bedrooms, setBedrooms] = useState(savedData?.bedrooms ?? "");
  const [bathrooms, setBathrooms] = useState(savedData?.bathrooms ?? "");
  const [balconies, setBalconies] = useState(savedData?.balconies ?? "");
  const [floorLevel, setFloorLevel] = useState(savedData?.floorLevel ?? "");
  const [mainDoorDirection, setMainDoorDirection] = useState(savedData?.mainDoorDirection ?? "");

  // Sub-step 3 – Amenities
  const [amenities, setAmenities] = useState<string[]>(savedData?.amenities ?? []);
  const [amenityOtherChecked, setAmenityOtherChecked] = useState(savedData?.amenityOtherChecked ?? false);
  const [amenityOtherText, setAmenityOtherText] = useState(savedData?.amenityOtherText ?? "");

  // Sub-step 4 – Rental Details
  const [tenantsPreferred, setTenantsPreferred] = useState<string[]>(savedData?.tenantsPreferred ?? []);
  const [monthlyRent, setMonthlyRent] = useState(savedData?.monthlyRent ?? "");
  const [rentNegotiable, setRentNegotiable] = useState(savedData?.rentNegotiable ?? false);
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(savedData?.maintenanceIncluded ?? false);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(savedData?.monthlyMaintenance ?? "");
  const [securityDeposit, setSecurityDeposit] = useState(savedData?.securityDeposit ?? "");
  const [availableFrom, setAvailableFrom] = useState(savedData?.availableFrom ?? "");

  // Sub-step 5 – Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableFromRef = useRef<HTMLInputElement>(null);

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSubStep(0);
    setNickname("");
    setAddress("");
    setArea("");
    setCity("");
    setPincode("");
    setCountry("India");
    setOwnerName("");
    setOwnerContact("");
    setPropertyType("");
    setPropertyTypeOther("");
    setUnitSize("");
    setUnitSizeOther("");
    setFurnishing("");
    setBuiltUpArea("");
    setBuiltUpUnits("sq ft");
    setTotalFloors("");
    setBedrooms("");
    setBathrooms("");
    setBalconies("");
    setFloorLevel("");
    setMainDoorDirection("");
    setAmenities([]);
    setAmenityOtherChecked(false);
    setAmenityOtherText("");
    setTenantsPreferred([]);
    setMonthlyRent("");
    setRentNegotiable(false);
    setMaintenanceIncluded(false);
    setMonthlyMaintenance("");
    setSecurityDeposit("");
    setAvailableFrom("");
    setImageUrls([]);
    setShowSuccess(false);
  };

  const openDatePicker = () => {
    availableFromRef.current?.showPicker?.();
    availableFromRef.current?.focus();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

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

  const parseAddressDetails = (value: string) => {
    const pincodeMatch = value.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      setPincode((current: string) => current || pincodeMatch[0]);
    }

    if (!city) {
      const foundCity = CITIES.find((c) => value.toLowerCase().includes(c.toLowerCase()));
      if (foundCity) setCity(foundCity);
    }

    if (!area) {
      const segments = value.split(",").map((part) => part.trim()).filter(Boolean);
      if (segments.length > 0) {
        setArea(segments[0]);
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (value.length > 10) parseAddressDetails(value);
  };

  const handleAddressPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("Text");
    if (pastedText) {
      parseAddressDetails(pastedText);
    }
  };

  const pincodeTouched = pincode.length > 0;
  const pincodeError = pincodeTouched && !/^\d{6}$/.test(pincode);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const data = {
      subStep,
      nickname,
      address,
      area,
      city,
      pincode,
      country,
      ownerName,
      ownerContact,
      propertyType,
      propertyTypeOther,
      unitSize,
      unitSizeOther,
      furnishing,
      builtUpArea,
      builtUpUnits,
      totalFloors,
      bedrooms,
      bathrooms,
      balconies,
      floorLevel,
      mainDoorDirection,
      amenities,
      amenityOtherChecked,
      amenityOtherText,
      tenantsPreferred,
      monthlyRent,
      rentNegotiable,
      maintenanceIncluded,
      monthlyMaintenance,
      securityDeposit,
      availableFrom,
      imageUrls,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }, [
    subStep,
    nickname,
    address,
    area,
    city,
    pincode,
    country,
    ownerName,
    ownerContact,
    propertyType,
    propertyTypeOther,
    unitSize,
    unitSizeOther,
    furnishing,
    builtUpArea,
    builtUpUnits,
    totalFloors,
    bedrooms,
    bathrooms,
    balconies,
    floorLevel,
    mainDoorDirection,
    amenities,
    amenityOtherChecked,
    amenityOtherText,
    tenantsPreferred,
    monthlyRent,
    rentNegotiable,
    maintenanceIncluded,
    monthlyMaintenance,
    securityDeposit,
    availableFrom,
    imageUrls,
  ]);

  // ── Validation ────────────────────────────────────────────────────────────────

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
      return !!(address && area && city && pincode && !pincodeError && country && ownerName && isValidContact(ownerContact));
    }
    if (subStep === 1) {
      const typeOk = propertyType !== "" && (propertyType !== "Other" || propertyTypeOther.trim() !== "");
      const sizeOk = unitSize !== "" && (unitSize !== "Other" || unitSizeOther.trim() !== "");
      return typeOk && sizeOk && furnishing !== "";
    }
    if (subStep === 2) {
      return !!(builtUpArea && builtUpUnits && totalFloors && bedrooms && bathrooms && balconies && floorLevel && mainDoorDirection);
    }
    if (subStep === 3) return true;
    if (subStep === 4) {
      return tenantsPreferred.length > 0 && !!monthlyRent && !!securityDeposit && !!availableFrom;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    const finalAmenities = [...amenities];
    if (amenityOtherChecked && amenityOtherText.trim()) {
      finalAmenities.push(amenityOtherText.trim());
    }

    addProperty({
      nickname,
      address,
      area,
      city,
      pincode,
      country,
      ownerName,
      ownerContact,
      propertyType,
      propertyTypeOther,
      unitSize,
      unitSizeOther,
      furnishing,
      builtUpArea,
      builtUpUnits,
      totalFloors,
      bedrooms,
      bathrooms,
      balconies,
      floorLevel,
      mainDoorDirection,
      amenities: finalAmenities,
      tenantsPreferred,
      monthlyRent,
      rentNegotiable,
      maintenanceIncluded,
      monthlyMaintenance,
      securityDeposit,
      availableFrom,
      images: imageUrls,
      imageCount: imageUrls.length,
      status: "Active",
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setLocation("/broker/properties");
    }, 2000);
  };

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((s: number) => s - 1);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    setLocation("/broker/properties");
  };

  const handleContinue = () => {
    if (subStep < 5) {
      setSubStep((s: number) => s + 1);
    } else {
      handleSubmit();
    }
  };

  // ── Sub-step Renders ─────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Property details
      </h2>
      <div className="space-y-4">
        <div>
          <FieldLabel>Property Nickname</FieldLabel>
          <Input
            placeholder="My property 01"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel required>Address</FieldLabel>
          <textarea
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onPaste={handleAddressPaste}
            placeholder="e.g. 201, Orchid Residency, Sector 76, Noida, 201301"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none h-20"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Area/Landmark</FieldLabel>
            <Input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder=""
            />
          </div>
          <div>
            <FieldLabel required>City</FieldLabel>
            <SelectField value={city} onChange={setCity} options={CITIES} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Pincode</FieldLabel>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder=""
              maxLength={6}
            />
            {pincodeError && (
              <p className="text-xs text-red-500 mt-1">Enter a valid 6-digit pincode.</p>
            )}
          </div>
          <div>
            <FieldLabel required>Country</FieldLabel>
            <SelectField value={country} onChange={setCountry} options={COUNTRIES} />
          </div>
        </div>

        <div className="pt-4 pb-1">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-100">
            Property Owner Details
          </h3>
        </div>
        <div>
          <FieldLabel required>Your Name</FieldLabel>
          <Input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder=""
          />
        </div>
        <div>
          <FieldLabel required>Email/Phone Number</FieldLabel>
          <Input
            value={ownerContact}
            onChange={(e) => setOwnerContact(e.target.value)}
            placeholder="email@example.com or +91 9876543210"
            className={contactError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}
          />
          {contactError && (
            <p className="text-xs text-red-500 mt-1">Enter a valid email address or phone number</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Tell us more about your property
      </h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Property Type</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <ChipButton
                key={t}
                label={t}
                selected={propertyType === t}
                onClick={() => {
                  setPropertyType(t);
                  if (t !== "Other") setPropertyTypeOther("");
                }}
              />
            ))}
          </div>
          {propertyType === "Other" && (
            <div className="mt-3">
              <Input
                placeholder="Specify property type"
                value={propertyTypeOther}
                onChange={(e) => setPropertyTypeOther(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Unit Size</p>
          <div className="flex flex-wrap gap-2">
            {UNIT_SIZES.map((s) => (
              <ChipButton
                key={s}
                label={s}
                selected={unitSize === s}
                onClick={() => {
                  setUnitSize(s);
                  if (s !== "Other") setUnitSizeOther("");
                }}
              />
            ))}
          </div>
          {unitSize === "Other" && (
            <div className="mt-3">
              <Input
                placeholder="Specify unit size"
                value={unitSizeOther}
                onChange={(e) => setUnitSizeOther(e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Furnishing Status</p>
          <div className="flex flex-wrap gap-2">
            {FURNISHING_OPTIONS.map((f) => (
              <ChipButton
                key={f}
                label={f}
                selected={furnishing === f}
                onClick={() => setFurnishing(f)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Tell us more about your property
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Built Up Area</FieldLabel>
            <Input
              value={builtUpArea}
              onChange={(e) => setBuiltUpArea(e.target.value)}
              placeholder=""
              type="number"
            />
          </div>
          <div>
            <FieldLabel required>Units</FieldLabel>
            <SelectField value={builtUpUnits} onChange={setBuiltUpUnits} options={UNIT_OPTIONS} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Total Floors</FieldLabel>
            <Input
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder="e.g. 10"
              type="text"
            />
          </div>
          <div>
            <FieldLabel required>Bedrooms</FieldLabel>
            <SelectField value={bedrooms} onChange={setBedrooms} options={BEDROOM_OPTIONS} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Bathrooms</FieldLabel>
            <SelectField value={bathrooms} onChange={setBathrooms} options={BATHROOM_OPTIONS} placeholder="Select" />
          </div>
          <div>
            <FieldLabel required>Balconies</FieldLabel>
            <SelectField value={balconies} onChange={setBalconies} options={BALCONY_OPTIONS} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Floor Level</FieldLabel>
            <Input
              value={floorLevel}
              onChange={(e) => setFloorLevel(e.target.value)}
              placeholder="e.g. 3rd"
              type="text"
            />
          </div>
          <div>
            <FieldLabel required>Direction of main door</FieldLabel>
            <SelectField value={mainDoorDirection} onChange={setMainDoorDirection} options={DIRECTION_OPTIONS} placeholder="Select" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Tell us more about your property
      </h2>
      <div className="grid grid-cols-2 gap-y-4 gap-x-12">
        <div className="space-y-4">
          {AMENITIES_LEFT.map((a) => (
            <AmenityCheck
              key={a}
              label={a}
              checked={amenities.includes(a)}
              onChange={() => toggleAmenity(a)}
            />
          ))}
        </div>
        <div className="space-y-4">
          {AMENITIES_RIGHT.map((a) => (
            <AmenityCheck
              key={a}
              label={a}
              checked={amenities.includes(a)}
              onChange={() => toggleAmenity(a)}
            />
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-gray-100 pt-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={amenityOtherChecked}
            onChange={(e) => setAmenityOtherChecked(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-gray-700">Other</span>
        </label>
        {amenityOtherChecked && (
          <div className="mt-3">
            <Input
              value={amenityOtherText}
              onChange={(e) => setAmenityOtherText(e.target.value)}
              placeholder="Type other amenities"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Rental details for the property
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Tenants Preferred<span className="text-red-500 ml-0.5">*</span>
          </p>
          <div className="flex items-center gap-6 flex-wrap pb-3 border-b border-gray-100">
            {["Family", "Bachelors - Male", "Bachelors - Female"].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tenantsPreferred.includes(t)}
                  onChange={() => toggleTenant(t)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel required>Expected Monthly Rent</FieldLabel>
          <div className="flex items-center border border-input rounded-md overflow-hidden">
            <span className="px-3 text-sm text-gray-500 border-r border-input bg-gray-50 h-9 flex items-center">₹</span>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="flex-1 h-9 px-3 text-sm focus:outline-none bg-white"
              placeholder=""
            />
            <span className="px-3 text-sm text-gray-500 border-l border-input bg-gray-50 h-9 flex items-center">/month</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rentNegotiable}
              onChange={(e) => setRentNegotiable(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">Rent Negotiable</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceIncluded}
              onChange={(e) => {
                setMaintenanceIncluded(e.target.checked);
                if (e.target.checked) setMonthlyMaintenance("");
              }}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">Maintenance included</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Monthly Maintenance Amount</FieldLabel>
            <div className={`flex items-center border rounded-md overflow-hidden transition-opacity ${maintenanceIncluded ? "opacity-40 pointer-events-none" : "border-input"}`}>
              <span className="px-3 text-sm text-gray-500 border-r border-input bg-gray-50 h-9 flex items-center">₹</span>
              <input
                type="number"
                value={monthlyMaintenance}
                onChange={(e) => setMonthlyMaintenance(e.target.value)}
                disabled={maintenanceIncluded}
                className="flex-1 h-9 px-3 text-sm focus:outline-none bg-white disabled:bg-gray-50"
              />
            </div>
          </div>
          <div>
            <FieldLabel required>Expected Security Deposit</FieldLabel>
            <div className="flex items-center border border-input rounded-md overflow-hidden">
              <span className="px-3 text-sm text-gray-500 border-r border-input bg-gray-50 h-9 flex items-center">₹</span>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="flex-1 h-9 px-3 text-sm focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel required>Available From</FieldLabel>
          <div
            className="flex items-center border border-input rounded-md overflow-hidden cursor-text"
            onClick={openDatePicker}
          >
            <span className="px-3 text-primary h-9 flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <input
              ref={availableFromRef}
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="flex-1 h-9 px-2 text-sm focus:outline-none bg-white appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6 pb-4 border-b border-gray-100">
        Upload property images
      </h2>
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Guidelines</p>
          <p className="text-xs text-gray-600 mb-3">
            Our AI system automatically checks every photo for clarity, lighting, and relevance.
            Following these guidelines ensures your listing is approved and published instantly.
          </p>
          <ul className="space-y-1">
            {[
              "Minimum 1 photos, maximum 5",
              "Show all rooms clearly with good lighting (daylight preferred)",
              "Clear and in focus",
            ].map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-gray-600">
                <Check size={12} className="text-green-600 mt-0.5 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        {imageUrls.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-primary/40 rounded-xl bg-blue-50/40 flex flex-col items-center justify-center py-10 gap-3 hover:bg-blue-50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <ImageIcon size={32} className="text-primary" />
            <p className="text-sm text-gray-700">
              Drag a <span className="text-primary font-medium">Image</span> to Upload
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-primary text-primary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Select photos
            </Button>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {imageUrls.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-primary/40 rounded-lg bg-blue-50/40 flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <Plus size={24} className="text-primary" />
              </button>
            )}
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <BrokerLayout>
      {/* Back link */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Progress bar */}
      <ProgressBar subStep={subStep} />

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8 pb-24 sm:pb-8">
        {subStep === 0 && renderStep0()}
        {subStep === 1 && renderStep1()}
        {subStep === 2 && renderStep2()}
        {subStep === 3 && renderStep3()}
        {subStep === 4 && renderStep4()}
        {subStep === 5 && renderStep5()}

        {/* Continue / Submit — desktop */}
        <div className="mt-8 hidden sm:flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue()}
            className="w-48 bg-primary hover:bg-primary/90"
          >
            {subStep === 5 ? "Submit" : "Continue →"}
          </Button>
        </div>
      </div>

      {/* Continue / Submit — mobile sticky */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white border-t border-gray-200 px-4 py-3">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!canContinue()}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {subStep === 5 ? "Submit" : "Continue →"}
        </Button>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 w-72 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={28} className="text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Successfully Verified!</p>
            <p className="text-sm text-gray-500">Property details have been saved</p>
          </div>
        </div>
      )}
    </BrokerLayout>
  );
}
