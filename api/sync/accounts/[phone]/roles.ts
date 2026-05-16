import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRolesForPhone, normalizePhone } from "@workspace/sync-store";
import { json } from "../../../_lib/http";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const phone = normalizePhone(String(req.query.phone ?? ""));
    if (phone.length !== 10) {
      json(res, 400, { error: "Invalid phone" });
      return;
    }
    const roles = await getRolesForPhone(phone);
    json(res, 200, { phone, roles });
  } catch (err) {
    json(res, 500, { error: "Failed to list roles", detail: String(err) });
  }
}
