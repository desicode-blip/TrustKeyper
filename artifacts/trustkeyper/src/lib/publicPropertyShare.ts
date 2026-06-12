import type { Property } from "@/lib/properties";
import { getProperties } from "@/lib/properties";
import { getActiveSession } from "@/lib/storageKeys";
import { pushAccountKeyToCloud } from "@/lib/cloudSync";
import { getPropertyInviteLabel } from "@/lib/ownerTenants";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

function shareSnapshotKey(propertyId: string): string {
  return `property_share_${propertyId}`;
}

export async function fetchSharedProperty(propertyId: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_BASE}/share/property/${encodeURIComponent(propertyId)}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = (await res.json()) as { property?: Property };
      if (json.property?.id === propertyId) return json.property;
    }
  } catch {
    /* fall through to local */
  }

  if (typeof window === "undefined") return null;
  return getProperties().find((p) => p.id === propertyId) ?? null;
}

export async function publishPropertyShare(property: Property): Promise<void> {
  const session = getActiveSession();
  if (!session) return;

  const payload = JSON.stringify({
    property,
    ownerPhone: session.phone,
    ownerRole: session.role,
    updatedAt: Date.now(),
  });

  try {
    const key = shareSnapshotKey(property.id);
    localStorage.setItem(`tk_${session.phone}_${session.role}_${key}`, payload);
    sessionStorage.setItem(`tk_${session.phone}_${session.role}_${key}`, payload);
    await pushAccountKeyToCloud(session.phone, session.role as "owner" | "broker", key, payload);
  } catch {
    /* non-blocking */
  }
}

export async function submitPropertyShareInquiry(input: {
  propertyId: string;
  name: string;
  phone: string;
  propertyLabel: string;
}): Promise<{ ok: boolean; isDuplicate?: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/share/property/${encodeURIComponent(input.propertyId)}/inquiry`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: input.name,
          phone: input.phone,
          propertyLabel: input.propertyLabel,
        }),
      },
    );
    if (res.ok) {
      const json = (await res.json()) as { isDuplicate?: boolean };
      return { ok: true, isDuplicate: json.isDuplicate };
    }
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: err?.error ?? "Could not submit inquiry" };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export function getPropertyShareLabel(property: Property): string {
  return getPropertyInviteLabel(property);
}
