import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as vercelDb from "./vercelSyncDb.js";
import type {
  OnboardRequest,
  OnboardResponse,
  OnboardStore,
} from "@workspace/broker-tenant-onboarding";
import { handleBrokerTenantOnboardRequest as handleBrokerTenantOnboardRequestCore } from "@workspace/broker-tenant-onboarding";

function onboardRequest(req: VercelRequest): OnboardRequest {
  return {
    method: req.method ?? "GET",
    query: req.query as Record<string, string | string[] | undefined>,
    body: req.body,
    headers: req.headers,
  };
}

function onboardResponse(res: VercelResponse): OnboardResponse {
  const adapted: OnboardResponse = {
    status(code: number) {
      res.status(code);
      return adapted;
    },
    setHeader(name: string, value: string | string[]) {
      res.setHeader(name, value);
      return adapted;
    },
    end(body: string) {
      res.end(body);
    },
  };
  return adapted;
}

async function loadOnboardStore(): Promise<OnboardStore> {
  if (vercelDb.usePostgres()) {
    return {
      findEntryByDataKey: async (dataKey: string) => {
        const rows = await vercelDb.queryRows<{ phone: string; role: string; value: string }>(
          `SELECT phone, role, value FROM user_data WHERE data_key = $1 LIMIT 1`,
          [dataKey],
        );
        return rows[0] ?? null;
      },
      getAccountData: vercelDb.getAccountData,
      setAccountDataKey: vercelDb.setAccountDataKey,
    };
  }
  return import("@workspace/sync-store");
}

export async function handleBrokerTenantOnboardRequest(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const store = await loadOnboardStore();
  const adaptedReq = onboardRequest(req);
  const adaptedRes = onboardResponse(res);
  await handleBrokerTenantOnboardRequestCore(adaptedReq, adaptedRes, store);
}
