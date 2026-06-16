import { Router } from "express";
import { runCampaignPreflightController } from "../../tools/campaign-preflight/controller";

const router = Router();

router.post("/check", runCampaignPreflightController);

export default router;
