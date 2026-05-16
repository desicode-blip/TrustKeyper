import type { VercelRequest, VercelResponse } from "@vercel/node";
import { accountHasProfile, normalizePhone } from "@workspace/sync-store";
import { json } from "../../../../_lib/http";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const phone = normalizePhone(String(req.query.phone ?? ""));
    const role = String(req.query.role ?? "");
    if (phone.length !== 10 || !role) {
      json(res, 400, { error: "Invalid phone or role" });
      return;
    }
    const exists = await accountHasProfile(phone, role);
    json(res, 200, { phone, role, exists });
  } catch (err) {
    json(res, 500, { error: "Failed to check account", detail: String(err) });
  }
}
