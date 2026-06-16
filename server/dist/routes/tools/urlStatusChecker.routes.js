"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../tools/url-status-checker/controller");
const router = (0, express_1.Router)();
router.post("/inspect", controller_1.inspectUrlsController);
exports.default = router;
