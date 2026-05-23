import { queueCloudSync } from "@/lib/cloudSync";
import { getItem, getSessionItem, setItem, setSessionItem } from "@/lib/storageKeys";

export type MaintenancePriority = "Urgent" | "Normal";
export type MaintenanceStatus = "New" | "In Progress" | "Completed";

export interface PropertyMaintenanceTicket {
  id: string;
  propertyId: string;
  ticketNumber: number;
  category: string;
  title: string;
  description?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedAt: number;
  imageUrl?: string;
}

const STORAGE_KEY = "owner_property_maintenance";

function readAll(): PropertyMaintenanceTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getItem(STORAGE_KEY) ?? getSessionItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PropertyMaintenanceTicket[]) : [];
  } catch {
    return [];
  }
}

function persist(list: PropertyMaintenanceTicket[]): void {
  try {
    const payload = JSON.stringify(list);
    setItem(STORAGE_KEY, payload);
    setSessionItem(STORAGE_KEY, payload);
    queueCloudSync(STORAGE_KEY, payload);
  } catch {
    /* ignore */
  }
}

export function getMaintenanceTicketsForProperty(propertyId: string): PropertyMaintenanceTicket[] {
  return readAll()
    .filter((t) => t.propertyId === propertyId)
    .sort((a, b) => b.reportedAt - a.reportedAt);
}

export function addMaintenanceTicket(
  input: Omit<PropertyMaintenanceTicket, "id" | "ticketNumber" | "reportedAt" | "status"> & {
    status?: MaintenanceStatus;
    reportedAt?: number;
  },
): PropertyMaintenanceTicket {
  const forProperty = readAll().filter((t) => t.propertyId === input.propertyId);
  const nextNum = forProperty.length > 0 ? Math.max(...forProperty.map((t) => t.ticketNumber)) + 1 : 1;
  const ticket: PropertyMaintenanceTicket = {
    ...input,
    id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ticketNumber: nextNum,
    status: input.status ?? "New",
    reportedAt: input.reportedAt ?? Date.now(),
  };
  persist([ticket, ...readAll()]);
  return ticket;
}

export function formatTicketReportedAt(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
