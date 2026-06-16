import { Router } from "express";
import { analyzeTrackingController } from "../../tools/tracking-inspector/controller";

const router = Router();

router.post("/analyze", analyzeTrackingController);

export default router;
