"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAttributesController = exports.extractAttributesController = void 0;
const service_1 = require("./service");
const getErrorMessage = (error) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return "Unexpected error.";
};
const extractAttributesController = (req, res) => {
    try {
        const { html, attribute } = (req.body ?? {});
        const values = (0, service_1.extractAttributeValues)(html, attribute);
        res.json({ values });
    }
    catch (error) {
        res.status(400).json({ error: getErrorMessage(error) });
    }
};
exports.extractAttributesController = extractAttributesController;
const replaceAttributesController = (req, res) => {
    try {
        const { html, attribute, replacements } = (req.body ?? {});
        const nextHtml = (0, service_1.replaceAttributeValues)(html, attribute, replacements);
        res.json({ html: nextHtml });
    }
    catch (error) {
        res.status(400).json({ error: getErrorMessage(error) });
    }
};
exports.replaceAttributesController = replaceAttributesController;
