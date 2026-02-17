"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAttributeValues = exports.extractAttributeValues = exports.ERROR_MESSAGES = void 0;
const cheerio = __importStar(require("cheerio"));
const types_1 = require("./types");
exports.ERROR_MESSAGES = {
    invalidAttribute: "Invalid attribute. Allowed: href, src.",
    invalidHtml: "Invalid html. Expected string.",
    invalidReplacements: "Invalid replacements. Expected object map.",
    invalidReplacementValue: "Invalid replacements. Values must be strings.",
};
const VALID_ATTRIBUTE_SET = new Set(types_1.VALID_ATTRIBUTES);
const HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
const isDocumentHtml = (html) => {
    const lower = html.toLowerCase();
    return lower.includes("<!doctype") || lower.includes("<html");
};
const loadHtml = (html) => {
    const isDocument = isDocumentHtml(html);
    const $ = cheerio.load(html, undefined, isDocument);
    return { $, isDocument };
};
const serializeHtml = (api, isDocument) => {
    if (isDocument) {
        return api.html();
    }
    return api.root().html() ?? "";
};
const ensureHtml = (html) => {
    if (typeof html !== "string") {
        throw new Error(exports.ERROR_MESSAGES.invalidHtml);
    }
    return html;
};
const ensureAttribute = (attribute) => {
    if (typeof attribute !== "string" || !VALID_ATTRIBUTE_SET.has(attribute)) {
        throw new Error(exports.ERROR_MESSAGES.invalidAttribute);
    }
    return attribute;
};
const ensureReplacements = (replacements) => {
    if (!replacements || typeof replacements !== "object" || Array.isArray(replacements)) {
        throw new Error(exports.ERROR_MESSAGES.invalidReplacements);
    }
    const record = replacements;
    for (const value of Object.values(record)) {
        if (typeof value !== "string") {
            throw new Error(exports.ERROR_MESSAGES.invalidReplacementValue);
        }
    }
    return record;
};
const extractAttributeValues = (htmlInput, attributeInput) => {
    const html = ensureHtml(htmlInput);
    const attribute = ensureAttribute(attributeInput);
    const { $ } = loadHtml(html);
    const values = [];
    const seen = new Set();
    $(`[${attribute}]`).each((_, element) => {
        const value = $(element).attr(attribute);
        if (value == null || value.trim().length === 0) {
            return;
        }
        if (seen.has(value)) {
            return;
        }
        seen.add(value);
        values.push(value);
    });
    return values;
};
exports.extractAttributeValues = extractAttributeValues;
const replaceAttributeValues = (htmlInput, attributeInput, replacementsInput) => {
    const html = ensureHtml(htmlInput);
    const attribute = ensureAttribute(attributeInput);
    const replacements = ensureReplacements(replacementsInput);
    const { $, isDocument } = loadHtml(html);
    let changed = false;
    $(`[${attribute}]`).each((_, element) => {
        const value = $(element).attr(attribute);
        if (value == null || value.trim().length === 0) {
            return;
        }
        if (HAS_OWN_PROPERTY.call(replacements, value)) {
            const replacement = replacements[value];
            if (replacement !== value) {
                $(element).attr(attribute, replacement);
                changed = true;
            }
        }
    });
    if (!changed) {
        return html;
    }
    return serializeHtml($, isDocument);
};
exports.replaceAttributeValues = replaceAttributeValues;
