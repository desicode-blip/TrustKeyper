import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getAccountData,
  normalizePhone,
  setAccountDataBulk,
} from "@workspace/sync-store";
import { json, readJsonBody } from "../../../../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const phone = normalizePhone(String(req.query.phone ?? ""));
  const role = String(req.query.role ?? "");

  if (phone.length !== 10 || !role) {
    json(res, 400, { error: "Invalid phone or role" });
    return;
  }

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
}
