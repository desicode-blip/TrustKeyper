/**
 * Vercel serverless entry for GET /api/payments-tenant-history —
 * authenticated tenant rent payment history.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleTenantPaymentHistoryRequest } from "./_lib/paymentReadHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleTenantPaymentHistoryRequest(req, res);
}
