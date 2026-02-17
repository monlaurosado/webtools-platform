"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/html-refactor/controller");
const router = (0, express_1.Router)();
router.post("/extract", controller_1.extractAttributesController);
router.post("/replace", controller_1.replaceAttributesController);
exports.default = router;
