import type { LeadStatus } from "./tenants";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

export type BrokerOnboardInviteStatus = "pending" | "submitted" | "expired";

export type BrokerOnboardInvitePayload = {
  tenantName: string;
  tenantPhone: string;
  brokerName: string;
  status: BrokerOnboardInviteStatus;
  expiresAt: number;
};

export type TenantOnboardSubmitPayload = {
  name: string;
  phone: string;
  linkedinUrl: string;
  occupancyFrom: string;
  who: "Family" | "Bachelor";
  identify?: ("Male" | "Female")[];
  food: "Veg" | "Non-Veg";
  city?: string;
  localities?: string[];
  propertyType?: string;
  sharing?: string;
  roommate?: ("Male" | "Female" | "Anyone")[];
  detailsComplete: boolean;
};

export type TenantOnboardSubmitResult =
  | { ok: true; brokerName: string; duplicate: boolean }
  | { ok: false; error: string; status?: number };

export async function fetchBrokerOnboardInvite(
  token: string,
): Promise<{ payload: BrokerOnboardInvitePayload | null; error: string | null; status?: number }> {
  try {
    const res = await fetch(`${API_BASE}/broker-tenant-onboard/${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        payload: null,
        error: json.error ?? "Could not load onboarding link",
        status: res.status,
      };
    }
    const json = (await res.json()) as BrokerOnboardInvitePayload;
    return { payload: json, error: null };
  } catch {
    return { payload: null, error: "Network error. Please check your connection and try again." };
  }
}

export async function submitTenantOnboardRequirements(
  token: string,
  body: TenantOnboardSubmitPayload,
): Promise<TenantOnboardSubmitResult> {
  try {
    const res = await fetch(
      `${API_BASE}/broker-tenant-onboard/${encodeURIComponent(token)}/submit`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      brokerName?: string;
      duplicate?: boolean;
    };
    if (!res.ok) {
      return { ok: false, error: json.error ?? "Failed to submit requirements", status: res.status };
    }
    return {
      ok: true,
      brokerName: json.brokerName ?? "your broker",
      duplicate: json.duplicate === true,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  "New Lead": "New Lead",
  Contacted: "Contacted",
  "Property Shared": "Property Shared",
  "Site Visit Scheduled": "Site Visit Scheduled",
  Converted: "Converted",
  Closed: "Closed",
};
