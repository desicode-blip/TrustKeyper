import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const { handleBrokerTenantOnboardRequest } = await import("./_lib/brokerTenantOnboardHandler.js");
    await handleBrokerTenantOnboardRequest(req, res);
  } catch (err) {
    json(res, 500, {
      error: "Broker tenant onboard function failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
