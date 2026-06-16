import { Router } from "express";
import { inspectUrlsController } from "../../tools/url-status-checker/controller";

const router = Router();

router.post("/inspect", inspectUrlsController);

export default router;
