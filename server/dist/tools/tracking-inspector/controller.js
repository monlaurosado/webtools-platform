"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTrackingController = void 0;
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
const analyzeTrackingController = (req, res) => {
    try {
        const { html } = (req.body ?? {});
        res.json((0, service_1.analyzeTracking)(html));
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(isValidationError(message) ? 400 : 500).json({ error: message });
    }
};
exports.analyzeTrackingController = analyzeTrackingController;
