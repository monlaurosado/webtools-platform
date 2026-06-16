"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/lead-csv-cleaner/controller");
const router = (0, express_1.Router)();
router.post("/clean", controller_1.cleanLeadCsvController);
exports.default = router;
