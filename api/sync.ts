import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleSyncRequest, syncPathSegments } from "./_lib/syncHandler.js";
import { json } from "./_lib/http.js";

/** Entry for /api/sync — nested paths arrive via vercel.json rewrite (?syncPath=...). */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const segments = syncPathSegments(req);
  if (segments.length === 0) {
    json(res, 404, { error: "Not found" });
    return;
  }
  await handleSyncRequest(req, res);
}
