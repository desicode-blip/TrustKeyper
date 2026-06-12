import { getSessionItem, removeSessionItem, setSessionItem } from "@/lib/storageKeys";

const KEY_PREFIX = "tk_tenant_share_session_";

export interface TenantShareSession {
  propertyId: string;
  name: string;
  phone: string;
  verifiedAt: number;
}

function sessionKey(propertyId: string): string {
  return `${KEY_PREFIX}${propertyId}`;
}

export function getTenantShareSession(propertyId: string): TenantShareSession | null {
  if (typeof window === "undefined" || !propertyId) return null;
  try {
    const raw = getSessionItem(sessionKey(propertyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TenantShareSession;
    if (parsed.propertyId !== propertyId) return null;
    if (!parsed.name?.trim() || !parsed.phone?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setTenantShareSession(session: TenantShareSession): void {
  try {
    setSessionItem(sessionKey(session.propertyId), JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function clearTenantShareSession(propertyId: string): void {
  try {
    removeSessionItem(sessionKey(propertyId));
    removeSessionItem(`${KEY_PREFIX}response_${propertyId}`);
  } catch {
    /* ignore */
  }
}

export type TenantShareResponse = "interested" | "not_interested";

export function getTenantShareResponse(propertyId: string): TenantShareResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = getSessionItem(`${KEY_PREFIX}response_${propertyId}`);
    if (raw === "interested" || raw === "not_interested") return raw;
    return null;
  } catch {
    return null;
  }
}

export function setTenantShareResponse(propertyId: string, response: TenantShareResponse): void {
  try {
    setSessionItem(`${KEY_PREFIX}response_${propertyId}`, response);
  } catch {
    /* ignore */
  }
}
