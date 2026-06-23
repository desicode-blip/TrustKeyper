import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const { handleTenantDocumentUploadRequest } = await import("./_lib/tenantDocumentUploadHandler.js");
    await handleTenantDocumentUploadRequest(req, res);
  } catch (err) {
    json(res, 500, {
      error: "Tenant document upload function failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
