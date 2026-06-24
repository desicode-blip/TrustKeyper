/**
 * Vercel serverless entry for POST /api/payments-create-order — rent collection order.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePaymentCreateOrderRequest } from "./_lib/paymentOrderHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handlePaymentCreateOrderRequest(req, res);
}
