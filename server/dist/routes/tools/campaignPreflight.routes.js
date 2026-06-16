"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/campaign-preflight/controller");
const router = (0, express_1.Router)();
router.post("/check", controller_1.runCampaignPreflightController);
exports.default = router;
