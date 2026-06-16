import { Router } from "express";
import { analyzeFormsController } from "../../tools/form-inspector/controller";

const router = Router();

router.post("/analyze", analyzeFormsController);

export default router;
