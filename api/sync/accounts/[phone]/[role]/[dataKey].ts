import type { VercelRequest, VercelResponse } from "@vercel/node";
import { normalizePhone, setAccountDataKey } from "@workspace/sync-store";
import { json, readJsonBody } from "../../../../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "PUT") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const phone = normalizePhone(String(req.query.phone ?? ""));
    const role = String(req.query.role ?? "");
    const dataKey = String(req.query.dataKey ?? "");
    const body = readJsonBody(req) as { value?: string } | null;
    const value = typeof body?.value === "string" ? body.value : null;

    if (phone.length !== 10 || !role || !dataKey || value === null) {
      json(res, 400, { error: "Invalid request" });
      return;
    }

    await setAccountDataKey(phone, role, dataKey, value);
    json(res, 200, { ok: true });
  } catch (err) {
    json(res, 500, { error: "Failed to save data", detail: String(err) });
  }
}
