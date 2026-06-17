import { Router, type IRouter, type Request, type Response } from "express";
import type {
  OnboardRequest,
  OnboardResponse,
  OnboardStore,
} from "@workspace/broker-tenant-onboarding";
import { handleBrokerTenantOnboardRequest } from "@workspace/broker-tenant-onboarding";
import * as syncStore from "@workspace/sync-store";

const router: IRouter = Router();

function onboardPathFromReq(req: Request): string {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  if (!token) return "";
  if (req.path.endsWith("/submit")) return `${token}/submit`;
  return token;
}

function onboardRequest(req: Request, onboardPath: string): OnboardRequest {
  return {
    method: req.method,
    query: { onboardPath },
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
  };
}

function onboardResponse(res: Response): OnboardResponse {
  let statusCode = 200;
  const adapted: OnboardResponse = {
    status(code: number) {
      statusCode = code;
      res.status(code);
      return adapted;
    },
    setHeader(name: string, value: string | string[]) {
      res.setHeader(name, value);
      return adapted;
    },
    end(body: string) {
      res.status(statusCode).type("json").send(body);
    },
  };
  return adapted;
}

async function loadOnboardStore(): Promise<OnboardStore> {
  return syncStore;
}

function runHandler(req: Request, res: Response): void {
  const onboardPath = onboardPathFromReq(req);
  if (!onboardPath) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const adaptedReq = onboardRequest(req, onboardPath);
  const adaptedRes = onboardResponse(res);

  void loadOnboardStore()
    .then((store) => handleBrokerTenantOnboardRequest(adaptedReq, adaptedRes, store))
    .catch((err: unknown) => {
      res.status(500).json({
        error: "Broker tenant onboard function failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    });
}

router.get("/broker-tenant-onboard/:token", runHandler);
router.post("/broker-tenant-onboard/:token/submit", runHandler);

export default router;
