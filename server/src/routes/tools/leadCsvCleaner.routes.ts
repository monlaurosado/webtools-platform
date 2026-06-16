import { Router } from "express";
import { cleanLeadCsvController } from "../../tools/lead-csv-cleaner/controller";

const router = Router();

router.post("/clean", cleanLeadCsvController);

export default router;
