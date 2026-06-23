/**
 * Vercel serverless entry for POST /api/payments-onboard-complete — steps 2-4.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePaymentOnboardCompleteRequest } from "./_lib/paymentOnboardHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handlePaymentOnboardCompleteRequest(req, res);
}
