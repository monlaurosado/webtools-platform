"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectUrlsController = void 0;
const service_1 = require("./service");
const getErrorMessage = (error) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return "Unexpected error.";
};
const isValidationError = (message) => {
    return Object.values(service_1.ERROR_MESSAGES).includes(message);
};
const inspectUrlsController = async (req, res) => {
    try {
        const { urls } = (req.body ?? {});
        res.json(await (0, service_1.inspectUrls)(urls));
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(isValidationError(message) ? 400 : 500).json({ error: message });
    }
};
exports.inspectUrlsController = inspectUrlsController;
