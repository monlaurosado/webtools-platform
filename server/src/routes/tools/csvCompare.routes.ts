import { Router } from "express";
import { compareCsvsController } from "../../tools/csv-compare/controller";

const router = Router();

router.post("/compare", compareCsvsController);

export default router;
