import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const { handleTenantWorkflowRequest } = await import("./_lib/tenantWorkflowHandler.js");
    await handleTenantWorkflowRequest(req, res);
  } catch (err) {
    json(res, 500, {
      error: "Tenant workflow function failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
