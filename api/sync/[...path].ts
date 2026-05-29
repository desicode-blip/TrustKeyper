import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  accountHasProfile,
  getAccountData,
  getRolesForPhone,
  normalizePhone,
  setAccountDataBulk,
  setAccountDataKey,
} from "@workspace/sync-store";
import { json, readJsonBody } from "../_lib/http.js";

function pathSegments(req: VercelRequest): string[] {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw.length > 0) return raw.split("/").filter(Boolean);
  return [];
}

/**
 * Single handler for all /api/sync/* routes (Vercel-friendly vs deeply nested [phone]/[role] files).
 *
 * - GET  /api/sync/accounts/:phone/roles
 * - GET  /api/sync/accounts/:phone/:role/exists
 * - GET  /api/sync/accounts/:phone/:role
 * - PUT  /api/sync/accounts/:phone/:role
 * - PUT  /api/sync/accounts/:phone/:role/:dataKey
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const segments = pathSegments(req);

  if (segments[0] !== "accounts") {
    json(res, 404, { error: "Not found" });
    return;
  }

  const phone = normalizePhone(segments[1] ?? "");
  if (phone.length !== 10) {
    json(res, 400, { error: "Invalid phone" });
    return;
  }

  // GET /api/sync/accounts/:phone/roles
  if (segments.length === 3 && segments[2] === "roles") {
    if (req.method !== "GET") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const roles = await getRolesForPhone(phone);
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

  // GET /api/sync/accounts/:phone/:role/exists
  if (segments.length === 4 && segments[3] === "exists") {
    if (req.method !== "GET") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const exists = await accountHasProfile(phone, role);
      json(res, 200, { phone, role, exists });
    } catch (err) {
      json(res, 500, { error: "Failed to check account", detail: String(err) });
    }
    return;
  }

  // GET|PUT /api/sync/accounts/:phone/:role
  if (segments.length === 3) {
    if (req.method === "GET") {
      try {
        const data = await getAccountData(phone, role);
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
      try {
        const body = readJsonBody(req) as { entries?: Record<string, string> } | null;
        const entries = body?.entries;
        if (!entries || typeof entries !== "object") {
          json(res, 400, { error: "Invalid request" });
          return;
        }
        await setAccountDataBulk(phone, role, entries);
        json(res, 200, { ok: true });
      } catch (err) {
        json(res, 500, { error: "Failed to save data", detail: String(err) });
      }
      return;
    }

    json(res, 405, { error: "Method not allowed" });
    return;
  }

  // PUT /api/sync/accounts/:phone/:role/:dataKey
  if (segments.length === 4) {
    if (req.method !== "PUT") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const dataKey = segments[3] ?? "";
      const body = readJsonBody(req) as { value?: string } | null;
      const value = typeof body?.value === "string" ? body.value : null;

      if (!dataKey || value === null) {
        json(res, 400, { error: "Invalid request" });
        return;
      }

      await setAccountDataKey(phone, role, dataKey, value);
      json(res, 200, { ok: true });
    } catch (err) {
      json(res, 500, { error: "Failed to save data", detail: String(err) });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
}
