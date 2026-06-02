/**
 * GET /api/admin/users — all platform user profiles (admin only).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { assertAdminAuth, readAuthorizationHeader } from "../_lib/adminAuth.js";
import { fetchAdminUsers } from "../_lib/adminDb.js";
import { json } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = await assertAdminAuth(readAuthorizationHeader(req.headers));
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    const users = await fetchAdminUsers();
    json(res, 200, { users });
  } catch (err) {
    json(res, 500, {
      error: "Failed to load admin users",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
