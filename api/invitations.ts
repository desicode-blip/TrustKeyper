import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const { handleCreateInvitation, handleInvitationsRequest } = await import(
      "./_lib/invitationsHandler.js"
    );
    const raw = req.query.invitePath ?? req.query.path;
    const hasPath =
      (Array.isArray(raw) && raw.length > 0) ||
      (typeof raw === "string" && raw.length > 0);

    if (!hasPath) {
      await handleCreateInvitation(req, res);
      return;
    }
    await handleInvitationsRequest(req, res);
  } catch (err) {
    json(res, 500, {
      error: "Invitations function failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
