import { Router } from "express";
import {
  extractAttributesController,
  replaceAttributesController,
} from "../../tools/html-refactor/controller";

const router = Router();

router.post("/extract", extractAttributesController);
router.post("/replace", replaceAttributesController);

export default router;
