/**
 * Vercel serverless entry for POST /api/payments-create-rent-order-tenant —
 * tenant-initiated monthly rent collection order.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleTenantRentOrderRequest } from "./_lib/paymentOrderHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleTenantRentOrderRequest(req, res);
}
