"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/csv-compare/controller");
const router = (0, express_1.Router)();
router.post("/compare", controller_1.compareCsvsController);
exports.default = router;
