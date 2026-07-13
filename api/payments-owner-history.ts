/**
 * Vercel serverless entry for GET /api/payments-owner-history —
 * authenticated owner rent payment history (includes settlement split).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOwnerPaymentHistoryRequest } from "./_lib/paymentReadHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleOwnerPaymentHistoryRequest(req, res);
}
