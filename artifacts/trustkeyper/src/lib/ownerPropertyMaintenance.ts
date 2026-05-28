import { queueCloudSync } from "@/lib/cloudSync";
import { getItem, setItem } from "@/lib/storageKeys";

export type MaintenanceStatus = "Open" | "In Progress" | "Resolved";

export interface PropertyMaintenanceTicket {
  id: string;
  propertyId: string;
  category: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  createdAt: number;
}

const STORAGE_KEY = "owner_property_maintenance";

function readAll(): PropertyMaintenanceTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PropertyMaintenanceTicket[]) : [];
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
  input: Omit<PropertyMaintenanceTicket, "id" | "status" | "createdAt">,
): PropertyMaintenanceTicket {
  const ticket: PropertyMaintenanceTicket = {
    ...input,
    id: `mnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "Open",
    createdAt: Date.now(),
  };
  const list = readAll();
  list.unshift(ticket);
  persist(list);
  return ticket;
}
