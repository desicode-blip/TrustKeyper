import { Router, type IRouter, type Request, type Response } from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleBrokerTenantOnboardRequest } from "../../../../api/_lib/brokerTenantOnboardHandler.js";

const router: IRouter = Router();

function onboardPathFromReq(req: Request): string {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  if (!token) return "";
  if (req.path.endsWith("/submit")) return `${token}/submit`;
  return token;
}

function runHandler(req: Request, res: Response): void {
  const onboardPath = onboardPathFromReq(req);
  let statusCode = 200;

  const vercelReq: VercelRequest = {
    method: req.method,
    query: { onboardPath },
    body: req.body,
    headers: req.headers,
  };

  const vercelRes: VercelResponse = {
    status(code: number) {
      statusCode = code;
      return vercelRes;
    },
    setHeader(name: string, value: string | string[]) {
      res.setHeader(name, value);
      return vercelRes;
    },
    end(body: string) {
      res.status(statusCode).type("json").send(body);
    },
  } as VercelResponse;

  void handleBrokerTenantOnboardRequest(vercelReq, vercelRes).catch((err: unknown) => {
    res.status(500).json({
      error: "Broker tenant onboard function failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  });
}

router.get("/broker-tenant-onboard/:token", runHandler);
router.post("/broker-tenant-onboard/:token/submit", runHandler);

export default router;
