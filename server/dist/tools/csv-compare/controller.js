"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCsvsController = void 0;
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
const compareCsvsController = (req, res) => {
    try {
        const { csvA, csvB, keyColumn } = (req.body ?? {});
        res.json((0, service_1.compareCsvs)(csvA, csvB, keyColumn));
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(isValidationError(message) ? 400 : 500).json({ error: message });
    }
};
exports.compareCsvsController = compareCsvsController;
