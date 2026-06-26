import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePaymentReleaseEscrowRequest } from "./_lib/paymentEscrowHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handlePaymentReleaseEscrowRequest(req, res);
}
