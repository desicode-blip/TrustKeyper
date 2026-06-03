import { queueCloudSync } from "@/lib/cloudSync";
import { getItem, setItem } from "@/lib/storageKeys";

export type MaintenanceStatus = "Open" | "In Progress" | "Resolved";

export interface PropertyMaintenanceTicket {
  id: string;
  propertyId: string;
  category: string;
  title: string;
  description: string;
  images: string[];
  status: MaintenanceStatus;
  createdAt: number;
}

const STORAGE_KEY = "owner_property_maintenance";

function readAll(): PropertyMaintenanceTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<PropertyMaintenanceTicket>[];
    return parsed
      .filter((t): t is Partial<PropertyMaintenanceTicket> & { propertyId: string; id: string } => Boolean(t?.id && t?.propertyId))
      .map((t) => ({
        id: t.id!,
        propertyId: t.propertyId!,
        category: t.category ?? "Other",
        title: t.title ?? "",
        description: t.description ?? "",
        images: Array.isArray(t.images) ? t.images : [],
        status: (t.status as MaintenanceStatus) ?? "Open",
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

function persist(list: PropertyMaintenanceTicket[]): void {
  try {
    const json = JSON.stringify(list);
    setItem(STORAGE_KEY, json);
    queueCloudSync(STORAGE_KEY, json);
  } catch {
    /* ignore */
  }
}

export function getPropertyMaintenanceTickets(propertyId: string): PropertyMaintenanceTicket[] {
  return readAll()
    .filter((t) => t.propertyId === propertyId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addPropertyMaintenanceTicket(
  input: Omit<PropertyMaintenanceTicket, "id" | "status" | "createdAt" | "images"> & {
    images?: string[];
  },
): PropertyMaintenanceTicket {
  const ticket: PropertyMaintenanceTicket = {
    ...input,
    images: input.images ?? [],
    id: `mnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "Open",
    createdAt: Date.now(),
  };
  const list = readAll();
  list.unshift(ticket);
  persist(list);
  return ticket;
}
