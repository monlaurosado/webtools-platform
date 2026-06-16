import { Router } from "express";
import { analyzePayloadController } from "../../tools/payload-inspector/controller";

const router = Router();

router.post("/analyze", analyzePayloadController);

export default router;
