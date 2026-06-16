"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/tracking-inspector/controller");
const router = (0, express_1.Router)();
router.post("/analyze", controller_1.analyzeTrackingController);
exports.default = router;
