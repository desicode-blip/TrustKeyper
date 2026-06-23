import type { Role } from "./auth";
import {
  getActiveSession,
  normalizePhoneDigits,
  setSessionItem,
  storageKey,
  writeLocalForAccount,
} from "./storageKeys";
import { syncAuthHeaders } from "./syncSession";
import { sanitizeDocumentUploadInviteForLocalStorage } from "./agreementDocumentUploadSanitize";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

/** Prefix for per-property public share snapshots (`property_share_<propertyId>`). */
export const PROPERTY_SHARE_KEY_PREFIX = "property_share_";

/** Prefix for broker tenant onboarding token snapshots (`broker_tenant_onboard_<token>`). */
export const BROKER_ONBOARD_TOKEN_PREFIX = "broker_tenant_onboard_";

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
  "owner_property_documents",
  "owner_property_maintenance",
  "owner_tenant_invites",
  "tenant_property_declines",
  "broker_tenant_onboarding_invites",
  "broker_tenant_onboard_analytics",
  "agreement_document_upload_invites",
] as const;

export type CloudSyncKey = (typeof CLOUD_SYNC_KEYS)[number];

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

function accountUrl(phone: string, role: string, suffix = ""): string {
  return `${API_BASE}/sync/accounts/${normalizePhoneDigits(phone)}/${role}${suffix}`;
}

/** Builds the localStorage data key for a property share snapshot. */
export function propertyShareDataKey(propertyId: string): string {
  return `${PROPERTY_SHARE_KEY_PREFIX}${propertyId}`;
}

type StorageLike = Pick<Storage, "length" | "key" | "getItem">;

/**
 * Collects dynamic `property_share_<id>` entries for bulk push.
 * Scans storage for keys matching the account prefix so orphaned snapshots are included.
 */
export function collectPropertyShareEntries(
  phone: string,
  role: string,
  store: StorageLike,
): Record<string, string> {
  const p = normalizePhoneDigits(phone);
  const keyPrefix = `${storageKey(p, role, PROPERTY_SHARE_KEY_PREFIX)}`;
  const entries: Record<string, string> = {};

  for (let i = 0; i < store.length; i++) {
    const fullKey = store.key(i);
    if (!fullKey?.startsWith(keyPrefix)) continue;
    const dataKey = fullKey.slice(`tk_${p}_${role}_`.length);
    if (!dataKey.startsWith(PROPERTY_SHARE_KEY_PREFIX)) continue;
    const value = store.getItem(fullKey);
    if (value) entries[dataKey] = value;
  }

  return entries;
}

/** Collects dynamic `broker_tenant_onboard_<token>` entries for bulk push. */
export function collectBrokerOnboardTokenEntries(
  phone: string,
  role: string,
  store: StorageLike,
): Record<string, string> {
  const p = normalizePhoneDigits(phone);
  const keyPrefix = `${storageKey(p, role, BROKER_ONBOARD_TOKEN_PREFIX)}`;
  const entries: Record<string, string> = {};

  for (let i = 0; i < store.length; i++) {
    const fullKey = store.key(i);
    if (!fullKey?.startsWith(keyPrefix)) continue;
    const dataKey = fullKey.slice(`tk_${p}_${role}_`.length);
    if (!dataKey.startsWith(BROKER_ONBOARD_TOKEN_PREFIX)) continue;
    const value = store.getItem(fullKey);
    if (value) entries[dataKey] = value;
  }

  return entries;
}

/** Merges static CLOUD_SYNC_KEYS and dynamic property share snapshots for bulk upload. */
export function collectBulkSyncEntries(
  phone: string,
  role: Role,
  store: StorageLike,
): Record<string, string> {
  const p = normalizePhoneDigits(phone);
  const entries: Record<string, string> = {};

  for (const key of CLOUD_SYNC_KEYS) {
    const raw = store.getItem(storageKey(p, role, key));
    if (raw) entries[key] = raw;
  }

  const shareEntries = collectPropertyShareEntries(p, role, store);
  for (const [key, value] of Object.entries(shareEntries)) {
    entries[key] = value;
  }

  const onboardEntries = collectBrokerOnboardTokenEntries(p, role, store);
  for (const [key, value] of Object.entries(onboardEntries)) {
    entries[key] = value;
  }

  return entries;
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
    if (dataKey === "agreement_document_upload_invites") {
      try {
        const invites = JSON.parse(value) as unknown[];
        if (Array.isArray(invites)) {
          const sanitized = invites.map((row) =>
            sanitizeDocumentUploadInviteForLocalStorage(
              row as Parameters<typeof sanitizeDocumentUploadInviteForLocalStorage>[0],
            ),
          );
          writeLocalForAccount(p, role, dataKey, JSON.stringify(sanitized), mirror);
          continue;
        }
      } catch {
        /* fall through to raw write */
      }
    }
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
  const entries =
    typeof localStorage !== "undefined"
      ? collectBulkSyncEntries(phone, role, localStorage)
      : {};

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
