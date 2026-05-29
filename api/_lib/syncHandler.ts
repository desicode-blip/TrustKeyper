import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertSyncAccountAuth } from "./syncAuth.js";
import { json, readJsonBody } from "./http.js";
import * as vercelDb from "./vercelSyncDb.js";

export function syncPathSegments(req: VercelRequest): string[] {
  const raw = req.query.syncPath ?? req.query.path;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw.length > 0) return raw.split("/").filter(Boolean);
  return [];
}

type SyncStore = {
  normalizePhone: (phone: string) => string;
  accountHasProfile: (phone: string, role: string) => Promise<boolean>;
  getAccountData: (phone: string, role: string) => Promise<Record<string, string>>;
  getRolesForPhone: (phone: string) => Promise<string[]>;
  setAccountDataBulk: (phone: string, role: string, entries: Record<string, string>) => Promise<void>;
  setAccountDataKey: (
    phone: string,
    role: string,
    dataKey: string,
    value: string,
  ) => Promise<void>;
};

async function loadSyncStore(): Promise<SyncStore> {
  if (vercelDb.usePostgres()) return vercelDb;
  return import("@workspace/sync-store");
}

function requestAuthorization(req: VercelRequest): string | undefined {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (Array.isArray(header)) return header[0];
  return header;
}

/** TEMP: remove after diagnosing signup cloud-save failures */
function logSyncAuthDebug(
  route: string,
  req: VercelRequest,
  phone: string,
  role: string,
  authHeader: string | undefined,
  authResult: Awaited<ReturnType<typeof assertSyncAccountAuth>>,
  responseStatus: number,
  extra?: Record<string, unknown>,
): void {
  console.log("[sync-auth-debug]", {
    route,
    method: req.method,
    phone,
    role,
    authorization: authHeader ?? null,
    authResult,
    responseStatus,
    ...extra,
  });
}

/**
 * Handles sync routes after vercel.json rewrites /api/sync/* → /api/sync?syncPath=...
 */
export async function handleSyncRequest(req: VercelRequest, res: VercelResponse): Promise<void> {
  const store = await loadSyncStore();
  const segments = syncPathSegments(req);

  if (segments[0] !== "accounts") {
    json(res, 404, { error: "Not found" });
    return;
  }

  const phone = store.normalizePhone(segments[1] ?? "");
  if (phone.length !== 10) {
    json(res, 400, { error: "Invalid phone" });
    return;
  }

  if (segments.length === 3 && segments[2] === "roles") {
    if (req.method !== "GET") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const roles = await store.getRolesForPhone(phone);
      json(res, 200, { phone, roles });
    } catch (err) {
      json(res, 500, { error: "Failed to list roles", detail: String(err) });
    }
    return;
  }

  const role = segments[2] ?? "";
  if (!role) {
    json(res, 400, { error: "Invalid role" });
    return;
  }

  if (segments.length === 4 && segments[3] === "exists") {
    if (req.method !== "GET") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const exists = await store.accountHasProfile(phone, role);
      json(res, 200, { phone, role, exists });
    } catch (err) {
      json(res, 500, { error: "Failed to check account", detail: String(err) });
    }
    return;
  }

  if (segments.length === 3) {
    if (req.method === "GET") {
      const authHeader = requestAuthorization(req);
      const auth = await assertSyncAccountAuth(authHeader, phone);
      if (!auth.ok) {
        logSyncAuthDebug("GET account", req, phone, role, authHeader, auth, auth.status);
        json(res, auth.status, { error: auth.error });
        return;
      }
      try {
        const data = await store.getAccountData(phone, role);
        if (!data.profile) {
          json(res, 404, { error: "Account not found" });
          return;
        }
        json(res, 200, { phone, role, data });
      } catch (err) {
        json(res, 500, { error: "Failed to load account", detail: String(err) });
      }
      return;
    }

    if (req.method === "PUT") {
      const authHeader = requestAuthorization(req);
      const auth = await assertSyncAccountAuth(authHeader, phone);
      if (!auth.ok) {
        logSyncAuthDebug("PUT account bulk", req, phone, role, authHeader, auth, auth.status);
        json(res, auth.status, { error: auth.error });
        return;
      }
      try {
        const body = readJsonBody(req) as { entries?: Record<string, string> } | null;
        const entries = body?.entries;
        if (!entries || typeof entries !== "object") {
          json(res, 400, { error: "Invalid request" });
          return;
        }
        await store.setAccountDataBulk(phone, role, entries);
        logSyncAuthDebug("PUT account bulk", req, phone, role, authHeader, auth, 200, {
          entryKeys: Object.keys(entries),
        });
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: "Failed to save data", detail: String(err) });
      }
      return;
    }

    json(res, 405, { error: "Method not allowed" });
    return;
  }

  if (segments.length === 4) {
    if (req.method !== "PUT") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    const authHeader = requestAuthorization(req);
    const auth = await assertSyncAccountAuth(authHeader, phone);
    const dataKey = segments[3] ?? "";
    if (!auth.ok) {
      logSyncAuthDebug("PUT account key", req, phone, role, authHeader, auth, auth.status, {
        dataKey,
      });
      json(res, auth.status, { error: auth.error });
      return;
    }
    try {
      const body = readJsonBody(req) as { value?: string } | null;
      const value = typeof body?.value === "string" ? body.value : null;

      if (!dataKey || value === null) {
        logSyncAuthDebug("PUT account key", req, phone, role, authHeader, auth, 400, { dataKey });
        json(res, 400, { error: "Invalid request" });
        return;
      }

      await store.setAccountDataKey(phone, role, dataKey, value);
      logSyncAuthDebug("PUT account key", req, phone, role, authHeader, auth, 200, { dataKey });
      json(res, 200, { ok: true });
    } catch (err) {
      logSyncAuthDebug("PUT account key", req, phone, role, authHeader, auth, 500, {
        dataKey,
        detail: String(err),
      });
      json(res, 500, { error: "Failed to save data", detail: String(err) });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
}
