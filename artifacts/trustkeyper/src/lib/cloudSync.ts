import type { Role } from "./auth";
import {
  getActiveSession,
  normalizePhoneDigits,
  setSessionItem,
  storageKey,
  writeLocalForAccount,
} from "./storageKeys";
import { syncAuthHeaders } from "./syncSession";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

/** Keys synced to the server so the same phone works on every device. */
export const CLOUD_SYNC_KEYS = [
  "profile",
  "properties",
  "tenants",
  "agreements",
  "agreement_draft",
  "onboarding_data",
  "add_property_data",
  "owner_tenant_inquiries",
  "broker_property_inquiries",
] as const;

export type CloudSyncKey = (typeof CLOUD_SYNC_KEYS)[number];

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

function accountUrl(phone: string, role: string, suffix = ""): string {
  return `${API_BASE}/sync/accounts/${normalizePhoneDigits(phone)}/${role}${suffix}`;
}

export async function cloudAccountExists(phone: string, role: Role): Promise<boolean> {
  try {
    const res = await fetch(accountUrl(phone, role, "/exists"), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { exists?: boolean };
    return json.exists === true;
  } catch {
    return false;
  }
}

export async function pullAccountFromCloud(phone: string, role: Role): Promise<boolean> {
  try {
    const headers = await syncAuthHeaders();
    if (!headers) return false;
    const res = await fetch(accountUrl(phone, role), { headers });
    if (res.status === 404) return false;
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: Record<string, string> };
    if (!json.data) return false;
    applyCloudDataToLocal(phone, role, json.data);
    return true;
  } catch {
    return false;
  }
}

export function applyCloudDataToLocal(
  phone: string,
  role: Role,
  data: Record<string, string>,
): void {
  const p = normalizePhoneDigits(phone);
  const session = getActiveSession();
  const mirror = session?.phone === p && session?.role === role;

  for (const [dataKey, value] of Object.entries(data)) {
    if (typeof value !== "string") continue;
    writeLocalForAccount(p, role, dataKey, value, mirror);
  }

  if (mirror && data.profile) {
    try {
      const profile = JSON.parse(data.profile) as Record<string, string>;
      if (profile.name) setSessionItem("name", profile.name);
      if (profile.firm) setSessionItem("firm", profile.firm);
      if (profile.phone) setSessionItem("phone", profile.phone);
    } catch {
      /* ignore */
    }
  }
}

export async function pushAccountKeyToCloud(
  phone: string,
  role: Role,
  dataKey: string,
  value: string,
  accessToken?: string,
): Promise<boolean> {
  try {
    const headers = await syncAuthHeaders("application/json", accessToken);
    if (!headers) return false;
    const res = await fetch(accountUrl(phone, role, `/${encodeURIComponent(dataKey)}`), {
      method: "PUT",
      headers,
      body: JSON.stringify({ value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pushLocalKeysToCloud(
  phone: string,
  role: Role,
  accessToken?: string,
): Promise<boolean> {
  const p = normalizePhoneDigits(phone);
  const entries: Record<string, string> = {};
  for (const key of CLOUD_SYNC_KEYS) {
    const raw = localStorage.getItem(storageKey(p, role, key));
    if (raw) entries[key] = raw;
  }
  if (Object.keys(entries).length === 0) return true;
  try {
    const headers = await syncAuthHeaders("application/json", accessToken);
    if (!headers) return false;
    const res = await fetch(accountUrl(phone, role), {
      method: "PUT",
      headers,
      body: JSON.stringify({ entries }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Debounced push after local writes (properties, profile, etc.). */
export function queueCloudSync(dataKey: string, value: string): void {
  const session = getActiveSession();
  if (!session) return;
  const timerKey = `${session.phone}:${session.role}:${dataKey}`;
  const existing = pushTimers.get(timerKey);
  if (existing) clearTimeout(existing);
  pushTimers.set(
    timerKey,
    setTimeout(() => {
      pushTimers.delete(timerKey);
      void pushAccountKeyToCloud(session.phone, session.role as Role, dataKey, value);
    }, 400),
  );
}

export async function fetchCloudRolesForPhone(phone: string): Promise<Role[]> {
  try {
    const p = normalizePhoneDigits(phone);
    const res = await fetch(`${API_BASE}/sync/accounts/${p}/roles`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { roles?: string[] };
    return (json.roles ?? []).filter((r): r is Role =>
      ["broker", "owner", "tenant", "manager"].includes(r),
    );
  } catch {
    return [];
  }
}
