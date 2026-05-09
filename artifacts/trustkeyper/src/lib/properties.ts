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

const KEY = "broker_properties";

export function getProperties(): Property[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
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
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  return property;
}

export function updatePropertyStatus(id: string, status: PropertyStatus): void {
  const list = getProperties();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }
}

export function getPropertyTitle(p: Property): string {
  const type = p.propertyType === "Other" ? (p.propertyTypeOther || "Property") : p.propertyType;
  const size = p.unitSize === "Other" ? (p.unitSizeOther || "") : p.unitSize;
  const label = size ? `${size} ${type}` : type;
  return `${label} in ${p.nickname || p.area}`;
}
