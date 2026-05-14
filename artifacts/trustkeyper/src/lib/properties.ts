import { getItem, getSessionItem, setItem, setSessionItem } from "./storageKeys";

export type PropertyStatus = "Active" | "Draft" | "Rented";

export interface Property {
  id: string;
  nickname?: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  country: string;
  ownerName: string;
  ownerContact: string;
  /** Additional owners saved from agreement flow, shown on property details. */
  coOwners?: { name: string; contact: string }[];
  propertyType: string;
  propertyTypeOther?: string;
  unitSize: string;
  unitSizeOther?: string;
  furnishing: string;
  builtUpArea: string;
  builtUpUnits: string;
  totalFloors: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  floorLevel: string;
  mainDoorDirection: string;
  amenities: string[];
  tenantsPreferred: string[];
  monthlyRent: string;
  rentNegotiable: boolean;
  maintenanceIncluded: boolean;
  monthlyMaintenance: string;
  securityDeposit: string;
  availableFrom: string;
  images: string[];
  imageCount: number;
  status: PropertyStatus;
  createdAt: number;
  uploadedBy?: "owner" | "broker";
}

const readProperties = (): Property[] => {
  if (typeof window === "undefined") return [];
  try {
    const localRaw = getItem("properties");
    const sessionRaw = getSessionItem("properties");
    const raw = localRaw ?? sessionRaw;
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
};

const saveProperties = (list: Property[]) => {
  try {
    const payload = JSON.stringify(list);
    setItem("properties", payload);
    setSessionItem("properties", payload);
  } catch {
    // ignore write errors
  }
};

export function getProperties(): Property[] {
  return readProperties();
}

export function addProperty(p: Omit<Property, "id" | "createdAt" | "status"> & { status?: PropertyStatus }): Property {
  const property: Property = {
    ...p,
    id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: p.status ?? "Active",
  };
  const list = getProperties();
  list.unshift(property);
  saveProperties(list);
  return property;
}

export function updatePropertyStatus(id: string, status: PropertyStatus): void {
  const list = getProperties();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    saveProperties(list);
  }
}

export function updateProperty(id: string, changes: Partial<Omit<Property, "id" | "createdAt" | "uploadedBy">>): void {
  const list = getProperties();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...changes };
    saveProperties(list);
  }
}

export function getPropertyTitle(p: Property): string {
  const type = p.propertyType === "Other" ? (p.propertyTypeOther || "Property") : p.propertyType;
  const size = p.unitSize === "Other" ? (p.unitSizeOther || "") : p.unitSize;
  const label = size ? `${size} ${type}` : type;
  return `${label} in ${p.nickname || p.area}`;
}
