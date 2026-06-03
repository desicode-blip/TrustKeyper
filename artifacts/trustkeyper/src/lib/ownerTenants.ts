import type { Food, TenantWho } from "@/lib/tenants";
import { queueCloudSync } from "@/lib/cloudSync";
import type { Property } from "@/lib/properties";
import { getItem, getSessionItem, setItem, setSessionItem } from "@/lib/storageKeys";

export type InquiryStatus = "open" | "invited";

/** Set only when the owner manually records an outcome. */
export type RecordedInviteStatus = "accepted" | "rejected";

export interface OwnerTenantInquiry {
  id: string;
  name: string;
  phone: string;
  propertyId: string;
  propertyLabel: string;
  who?: TenantWho;
  food?: Food;
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
  /** Legacy values are normalized on read; new invites omit status until marked. */
  status?: RecordedInviteStatus | "pending" | "pending_confirmation" | "declined" | "expired";
  inquiryId?: string;
  linkedinUrl?: string;
  createdAt: number;
  acceptedAt?: number;
  rejectedAt?: number;
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
export const OWNER_INVITES_UPDATED_EVENT = "tk-owner-invites-updated";

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
    if (dataType === INVITES_KEY && typeof window !== "undefined") {
      window.dispatchEvent(new Event(OWNER_INVITES_UPDATED_EVENT));
    }
  } catch {
    /* ignore */
  }
}

/** Returns a manual outcome badge only after the owner updates status. */
export function getRecordedInviteStatus(
  invite: OwnerTenantInvite,
): RecordedInviteStatus | null {
  if (invite.status === "accepted") return "accepted";
  if (invite.status === "rejected" || invite.status === "declined") return "rejected";
  return null;
}

export function getPropertyInviteLabel(p: Property): string {
  const title = p.nickname || p.address || "Property";
  const loc = [p.area, p.city].filter(Boolean).join(", ");
  return loc ? `${title}, ${loc}` : title;
}

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

export function updateOwnerInviteStatus(
  inviteId: string,
  status: RecordedInviteStatus,
): OwnerTenantInvite | null {
  const invites = getOwnerInvites();
  const idx = invites.findIndex((i) => i.id === inviteId);
  if (idx === -1) return null;

  const now = Date.now();
  const updated: OwnerTenantInvite = {
    ...invites[idx],
    status,
    acceptedAt: status === "accepted" ? now : invites[idx].acceptedAt,
    rejectedAt: status === "rejected" ? now : invites[idx].rejectedAt,
  };
  invites[idx] = updated;
  persist(INVITES_KEY, invites);
  return updated;
}

export function deleteOwnerInvite(inviteId: string): boolean {
  const invites = getOwnerInvites();
  const next = invites.filter((i) => i.id !== inviteId);
  if (next.length === invites.length) return false;
  persist(INVITES_KEY, next);
  return true;
}

export function formatMemberContact(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10}`;
  }
  return phone;
}

export function formatInviteAmount(value: string): string {
  const n = value.replace(/\D/g, "");
  if (!n) return "0";
  return Number(n).toLocaleString("en-IN");
}

export function formatInviteStartDate(isoOrDate: string): string {
  if (!isoOrDate) return "—";
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return isoOrDate;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoOrDate;
  }
}

export function buildWhatsAppInviteMessage(invite: OwnerTenantInvite): string {
  return (
    `Hello ${invite.name.trim() || "there"},\n\n` +
    `You have been invited to join the property:\n\n` +
    `Property: ${invite.propertyLabel}\n` +
    `Monthly Rent: ₹${formatInviteAmount(invite.monthlyRent)}\n` +
    `Security Deposit: ₹${formatInviteAmount(invite.securityDeposit)}\n` +
    `Start Date: ${formatInviteStartDate(invite.startDate)}\n\n` +
    `Sent via TrustKeyper.`
  );
}

export function whatsAppInviteHref(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "https://wa.me/";
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppInviteHref(invite: OwnerTenantInvite): string {
  return whatsAppInviteHref(invite.phone, buildWhatsAppInviteMessage(invite));
}

export function isInviteFromInquiry(invite: OwnerTenantInvite): boolean {
  return !!invite.inquiryId;
}

export function countRecordedInvites(invites: OwnerTenantInvite[]) {
  let accepted = 0;
  let rejected = 0;
  for (const inv of invites) {
    const s = getRecordedInviteStatus(inv);
    if (s === "accepted") accepted += 1;
    if (s === "rejected") rejected += 1;
  }
  return { accepted, rejected };
}
