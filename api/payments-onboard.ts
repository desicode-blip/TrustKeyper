/**
 * Vercel serverless entry for POST /api/payments/onboard — Route recipient onboarding.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePaymentOnboardRequest } from "./_lib/paymentOnboardHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handlePaymentOnboardRequest(req, res);
}
