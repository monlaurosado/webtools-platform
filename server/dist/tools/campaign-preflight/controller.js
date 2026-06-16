"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCampaignPreflightController = void 0;
const service_1 = require("./service");
const getErrorMessage = (error) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return "Unexpected error.";
};
const isValidationError = (message) => {
    return (Object.values(service_1.ERROR_MESSAGES).includes(message) ||
        message.startsWith("Invalid ") ||
        message.includes("exceeds the 1 MB limit") ||
        message === "Too many URLs. Maximum is 50.");
};
const runCampaignPreflightController = async (req, res) => {
    try {
        const { html, urls } = (req.body ?? {});
        res.json(await (0, service_1.runCampaignPreflight)(html, urls));
    }
    catch (error) {
        const message = getErrorMessage(error);
        res.status(isValidationError(message) ? 400 : 500).json({ error: message });
    }
};
exports.runCampaignPreflightController = runCampaignPreflightController;
