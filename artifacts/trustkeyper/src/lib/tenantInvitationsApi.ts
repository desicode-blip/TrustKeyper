import { syncAuthHeaders } from "@/lib/syncSession";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

export type PublicInvitation = {
  token: string;
  propertyLabel: string;
  ownerName: string;
  tenantName: string;
  monthlyRent: string;
  maintenanceIncluded: boolean;
  monthlyMaintenance: string;
  securityDeposit: string;
  startDate: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
};

export type ServerInvitation = PublicInvitation & {
  id: string;
  ownerPhone: string;
  propertyId: string;
  tenantPhone: string;
  createdAt: string;
};

export function invitePublicUrl(token: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const base = (import.meta.env.BASE_URL as string | undefined) ?? "/";
  const pathBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${origin}${pathBase}/invite/${token}`;
}

export function whatsAppInviteMessage(params: {
  tenantName: string;
  ownerName: string;
  propertyLabel: string;
  inviteUrl: string;
}): string {
  const name = params.tenantName.trim() || "there";
  return (
    `Hi ${name},\n\n` +
    `${params.ownerName} has invited you to rent ${params.propertyLabel} on Trustkeyper.\n\n` +
    `Please review the invitation and respond here:\n${params.inviteUrl}\n\n` +
    `Thank you.`
  );
}

export function whatsAppInviteHref(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "https://wa.me/";
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
}

export async function createTenantInvitation(input: {
  ownerPhone: string;
  ownerName: string;
  propertyId: string;
  propertyLabel: string;
  tenantName: string;
  tenantPhone: string;
  monthlyRent: string;
  maintenanceIncluded: boolean;
  monthlyMaintenance: string;
  securityDeposit: string;
  startDate: string;
}): Promise<ServerInvitation | null> {
  const headers = await syncAuthHeaders("application/json");
  if (!headers) return null;
  try {
    const res = await fetch(`${API_BASE}/invitations`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { invitation?: ServerInvitation };
    return json.invitation ?? null;
  } catch {
    return null;
  }
}

export async function fetchOwnerInvitations(
  ownerPhone: string,
): Promise<ServerInvitation[]> {
  const headers = await syncAuthHeaders();
  if (!headers) return [];
  try {
    const q = new URLSearchParams({ ownerPhone });
    const res = await fetch(`${API_BASE}/invitations/mine?${q}`, { headers });
    if (!res.ok) return [];
    const json = (await res.json()) as { invites?: ServerInvitation[] };
    return json.invites ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicInvitation(
  token: string,
): Promise<PublicInvitation | null> {
  try {
    const res = await fetch(`${API_BASE}/invitations/${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { invitation?: PublicInvitation };
    return json.invitation ?? null;
  } catch {
    return null;
  }
}

export async function respondToInvitation(
  token: string,
  action: "accept" | "decline",
): Promise<{ invitation: PublicInvitation | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/invitations/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });
    const json = (await res.json()) as {
      invitation?: PublicInvitation;
      error?: string;
    };
    return { invitation: json.invitation ?? null, error: json.error };
  } catch {
    return { invitation: null, error: "network" };
  }
}
