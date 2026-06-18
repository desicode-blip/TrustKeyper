import { queueCloudSync, pushAccountKeyToCloud, BROKER_ONBOARD_TOKEN_PREFIX } from "./cloudSync";
import { getActiveSession, getItem, setItem } from "./storageKeys";
import { findTenantByContact, getTenants, type Tenant } from "./tenants";

export { BROKER_ONBOARD_TOKEN_PREFIX };
export const BROKER_ONBOARDING_INVITES_KEY = "broker_tenant_onboarding_invites";

export const BROKER_ONBOARD_EXPIRY_DAYS = 14;

export type BrokerOnboardInviteStatus = "pending" | "submitted" | "expired";

export interface BrokerTenantOnboardingInvite {
  id: string;
  token: string;
  tenantName: string;
  tenantPhone: string;
  brokerPhone: string;
  brokerName: string;
  status: BrokerOnboardInviteStatus;
  createdAt: number;
  expiresAt: number;
  submittedAt?: number;
}

export interface BrokerOnboardTokenSnapshot {
  token: string;
  tenantName: string;
  tenantPhone: string;
  brokerPhone: string;
  brokerName: string;
  status: BrokerOnboardInviteStatus;
  createdAt: number;
  expiresAt: number;
  submittedAt?: number;
}

function phoneLast10(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function formatPhoneE164(phone: string): string {
  const digits = phoneLast10(phone);
  return digits.length === 10 ? `+91${digits}` : phone.trim();
}

function readInvites(): BrokerTenantOnboardingInvite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getItem(BROKER_ONBOARDING_INVITES_KEY);
    return raw ? (JSON.parse(raw) as BrokerTenantOnboardingInvite[]) : [];
  } catch {
    return [];
  }
}

function persistInvites(list: BrokerTenantOnboardingInvite[]): void {
  const payload = JSON.stringify(list);
  setItem(BROKER_ONBOARDING_INVITES_KEY, payload);
  queueCloudSync(BROKER_ONBOARDING_INVITES_KEY, payload);
}

function onboardTokenKey(token: string): string {
  return `${BROKER_ONBOARD_TOKEN_PREFIX}${token}`;
}

function snapshotFromInvite(invite: BrokerTenantOnboardingInvite): BrokerOnboardTokenSnapshot {
  return {
    token: invite.token,
    tenantName: invite.tenantName,
    tenantPhone: invite.tenantPhone,
    brokerPhone: invite.brokerPhone,
    brokerName: invite.brokerName,
    status: invite.status,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
    submittedAt: invite.submittedAt,
  };
}

export function isValidIndianMobile(phone: string): boolean {
  return phoneLast10(phone).length === 10;
}

export function getBrokerOnboardingInvites(): BrokerTenantOnboardingInvite[] {
  return readInvites();
}

export function findPendingInviteByPhone(phone: string): BrokerTenantOnboardingInvite | undefined {
  const digits = phoneLast10(phone);
  return readInvites().find(
    (inv) =>
      phoneLast10(inv.tenantPhone) === digits &&
      inv.status === "pending" &&
      inv.expiresAt > Date.now(),
  );
}

export function findDuplicateTenantLead(phone: string): Tenant | undefined {
  return findTenantByContact(phone);
}

export function getTenantOnboardUrl(token: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  const path = `${normalized}/onboard/tenant/${token}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function buildBrokerTenantOnboardWhatsAppMessage(
  tenantName: string,
  link: string,
): string {
  const name = tenantName.trim() || "there";
  return [
    `Hi ${name},`,
    "",
    "Share your rental requirements with me through TrustKeyper so I can help you find properties that best match your needs.",
    "",
    link,
  ].join("\n");
}

export function buildBrokerTenantOnboardShareMessage(
  tenantName: string,
  link: string,
): string {
  return buildBrokerTenantOnboardWhatsAppMessage(tenantName, link);
}

export function formatTenantPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `+91 ${digits}` : phone;
}

export function getBrokerTenantOnboardEmailHref(
  tenantName: string,
  link: string,
): string {
  const subject = encodeURIComponent("Complete your rental requirements on TrustKeyper");
  const body = encodeURIComponent(buildBrokerTenantOnboardShareMessage(tenantName, link));
  return `mailto:?subject=${subject}&body=${body}`;
}

export function getBrokerTenantOnboardSmsHref(
  tenantPhone: string,
  tenantName: string,
  link: string,
): string {
  const digits = phoneLast10(tenantPhone);
  const body = encodeURIComponent(buildBrokerTenantOnboardShareMessage(tenantName, link));
  if (digits.length === 10) {
    return `sms:+91${digits}?body=${body}`;
  }
  return `sms:?body=${body}`;
}

export function getBrokerTenantOnboardTelegramHref(
  tenantName: string,
  link: string,
): string {
  const text = encodeURIComponent(buildBrokerTenantOnboardShareMessage(tenantName, link));
  const url = encodeURIComponent(link);
  return `https://t.me/share/url?url=${url}&text=${text}`;
}

export function getBrokerTenantOnboardWhatsAppHref(
  tenantPhone: string,
  tenantName: string,
  link: string,
): string {
  const digits = phoneLast10(tenantPhone);
  const message = encodeURIComponent(buildBrokerTenantOnboardWhatsAppMessage(tenantName, link));
  if (digits.length === 10) {
    return `https://wa.me/91${digits}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

function generateToken(): string {
  return `bt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export type CreateBrokerOnboardInviteResult =
  | { ok: true; invite: BrokerTenantOnboardingInvite; link: string; whatsAppHref: string }
  | { ok: false; error: "invalid_name" | "invalid_phone" | "duplicate_tenant" | "duplicate_invite" | "no_session" };

export async function createBrokerTenantOnboardingInvite(
  tenantName: string,
  tenantPhone: string,
): Promise<CreateBrokerOnboardInviteResult> {
  const session = getActiveSession();
  if (!session || session.role !== "broker") {
    return { ok: false, error: "no_session" };
  }

  const name = tenantName.trim();
  const phone = formatPhoneE164(tenantPhone);
  if (name.length < 2) return { ok: false, error: "invalid_name" };
  if (!isValidIndianMobile(phone)) return { ok: false, error: "invalid_phone" };

  if (findDuplicateTenantLead(phone)) {
    return { ok: false, error: "duplicate_tenant" };
  }

  const pending = findPendingInviteByPhone(phone);
  if (pending) {
    return { ok: false, error: "duplicate_invite" };
  }

  const brokerName =
    (typeof window !== "undefined" && getItem("name")) ||
    session.phone;

  const now = Date.now();
  const invite: BrokerTenantOnboardingInvite = {
    id: `btoi_${now}_${Math.random().toString(36).slice(2, 7)}`,
    token: generateToken(),
    tenantName: name,
    tenantPhone: phone,
    brokerPhone: session.phone,
    brokerName: brokerName.trim() || "Your broker",
    status: "pending",
    createdAt: now,
    expiresAt: now + BROKER_ONBOARD_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };

  const list = readInvites();
  list.unshift(invite);
  persistInvites(list);

  const tokenPayload = JSON.stringify(snapshotFromInvite(invite));
  setItem(onboardTokenKey(invite.token), tokenPayload);
  void pushAccountKeyToCloud(session.phone, "broker", onboardTokenKey(invite.token), tokenPayload);

  const link = getTenantOnboardUrl(invite.token);
  return {
    ok: true,
    invite,
    link,
    whatsAppHref: getBrokerTenantOnboardWhatsAppHref(phone, name, link),
  };
}

export function markInviteSubmittedLocally(token: string): void {
  const list = readInvites();
  const idx = list.findIndex((inv) => inv.token === token);
  if (idx === -1) return;
  list[idx] = {
    ...list[idx],
    status: "submitted",
    submittedAt: Date.now(),
  };
  persistInvites(list);
}
