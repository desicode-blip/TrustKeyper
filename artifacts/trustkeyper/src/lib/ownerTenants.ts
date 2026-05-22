import type { Food, TenantWho } from "@/lib/tenants";
import { queueCloudSync } from "@/lib/cloudSync";
import type { Property } from "@/lib/properties";
import { getItem, getSessionItem, setItem, setSessionItem } from "@/lib/storageKeys";

export type InquiryStatus = "open" | "invited";

export interface OwnerTenantInquiry {
  id: string;
  name: string;
  phone: string;
  propertyId: string;
  propertyLabel: string;
  who?: TenantWho;
  food?: Food;
  /** LinkedIn profile URL — only set when a logged-in tenant submits an inquiry. */
  linkedinUrl?: string;
  status: InquiryStatus;
  createdAt: number;
}

export interface OwnerTenantInvite {
  id: string;
  propertyId: string;
  propertyLabel: string;
  name: string;
  phone: string;
  who?: TenantWho;
  food?: Food;
  monthlyRent: string;
  maintenanceIncluded: boolean;
  monthlyMaintenance: string;
  securityDeposit: string;
  startDate: string;
  status: "pending_confirmation";
  inquiryId?: string;
  linkedinUrl?: string;
  createdAt: number;
}

export interface SendTenantInvitePayload {
  propertyId: string;
  propertyLabel: string;
  members: Array<{
    name: string;
    phone: string;
    who?: TenantWho;
    food?: Food;
    inquiryId?: string;
  }>;
  monthlyRent: string;
  maintenanceIncluded: boolean;
  monthlyMaintenance: string;
  securityDeposit: string;
  startDate: string;
}

const INQUIRIES_KEY = "owner_tenant_inquiries";
const INVITES_KEY = "owner_tenant_invites";

function readJson<T>(dataType: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getSessionItem(dataType) ?? getItem(dataType);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist(dataType: string, list: unknown[]): void {
  try {
    const payload = JSON.stringify(list);
    setSessionItem(dataType, payload);
    setItem(dataType, payload);
    queueCloudSync(dataType, payload);
  } catch {
    /* ignore */
  }
}

export function getPropertyInviteLabel(p: Property): string {
  const title = p.nickname || p.address || "Property";
  const loc = [p.area, p.city].filter(Boolean).join(", ");
  return loc ? `${title}, ${loc}` : title;
}

/** Remove legacy demo inquiry rows from earlier builds. */
export function removeLegacySeedInquiries(): void {
  const list = readJson<OwnerTenantInquiry>(INQUIRIES_KEY);
  const cleaned = list.filter((i) => !i.id.startsWith("inq_seed_"));
  if (cleaned.length !== list.length) {
    persist(INQUIRIES_KEY, cleaned);
  }
}

export function getOwnerInquiries(): OwnerTenantInquiry[] {
  return readJson<OwnerTenantInquiry>(INQUIRIES_KEY);
}

export function getOpenInquiriesForProperty(propertyId: string): OwnerTenantInquiry[] {
  return getOwnerInquiries().filter((i) => i.propertyId === propertyId && i.status === "open");
}

export function getOwnerInvites(): OwnerTenantInvite[] {
  return readJson<OwnerTenantInvite>(INVITES_KEY);
}

export function sendOwnerTenantInvites(payload: SendTenantInvitePayload): OwnerTenantInvite[] {
  const inquiries = getOwnerInquiries();
  const invites = getOwnerInvites();
  const created: OwnerTenantInvite[] = [];

  for (const member of payload.members) {
    const invite: OwnerTenantInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      propertyId: payload.propertyId,
      propertyLabel: payload.propertyLabel,
      name: member.name,
      phone: member.phone,
      who: member.who,
      food: member.food,
      monthlyRent: payload.monthlyRent,
      maintenanceIncluded: payload.maintenanceIncluded,
      monthlyMaintenance: payload.monthlyMaintenance,
      securityDeposit: payload.securityDeposit,
      startDate: payload.startDate,
      status: "pending_confirmation",
      inquiryId: member.inquiryId,
      createdAt: Date.now(),
    };
    created.push(invite);
    invites.unshift(invite);

    if (member.inquiryId) {
      const idx = inquiries.findIndex((i) => i.id === member.inquiryId);
      if (idx !== -1) {
        const inq = inquiries[idx];
        invite.linkedinUrl = inq.linkedinUrl;
        inquiries[idx] = { ...inq, status: "invited" };
      }
    }
  }

  persist(INQUIRIES_KEY, inquiries);
  persist(INVITES_KEY, invites);
  return created;
}

export function formatMemberContact(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10}`;
  }
  return phone;
}

export function whatsAppHref(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "https://wa.me/";
  return `https://wa.me/91${digits}`;
}

export function isInviteFromInquiry(invite: OwnerTenantInvite): boolean {
  return !!invite.inquiryId;
}
