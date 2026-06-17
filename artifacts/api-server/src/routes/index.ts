import { Router, type IRouter } from "express";
import healthRouter from "./health";
import invitationsRouter from "./invitations";
import brokerTenantOnboardRouter from "./brokerTenantOnboard";
import syncRouter from "./sync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(syncRouter);
router.use(invitationsRouter);
router.use(brokerTenantOnboardRouter);

export default router;
