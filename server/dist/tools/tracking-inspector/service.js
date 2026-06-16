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
exports.analyzeTracking = exports.ERROR_MESSAGES = exports.MAX_HTML_BYTES = void 0;
const cheerio = __importStar(require("cheerio"));
exports.MAX_HTML_BYTES = 1024 * 1024;
exports.ERROR_MESSAGES = {
    invalidHtml: "Invalid html. Expected string.",
    htmlTooLarge: "HTML input exceeds the 1 MB limit.",
};
const ensureHtml = (html) => {
    if (typeof html !== "string") {
        throw new Error(exports.ERROR_MESSAGES.invalidHtml);
    }
    if (Buffer.byteLength(html, "utf8") > exports.MAX_HTML_BYTES) {
        throw new Error(exports.ERROR_MESSAGES.htmlTooLarge);
    }
    return html;
};
const getLocation = ($, element) => {
    if ($(element).parents("head").length > 0) {
        return "head";
    }
    if ($(element).parents("body").length > 0) {
        return "body";
    }
    return "unknown";
};
const getQueryId = (src) => {
    try {
        return new URL(src).searchParams.get("id");
    }
    catch {
        return null;
    }
};
const matchIdentifier = (value, pattern) => {
    const match = value.match(pattern);
    return match?.[1] ?? match?.[0] ?? null;
};
const detectProvider = (src, content) => {
    const haystack = `${src ?? ""}\n${content}`;
    const lower = haystack.toLowerCase();
    if (lower.includes("googletagmanager.com/gtm.js") || /GTM-[A-Z0-9]+/i.test(haystack)) {
        return {
            provider: "Google Tag Manager",
            identifier: getQueryId(src ?? "") ?? matchIdentifier(haystack, /GTM-[A-Z0-9]+/i),
        };
    }
    if (lower.includes("googletagmanager.com/gtag/js") ||
        /(?:G|UA|AW)-[A-Z0-9-]+/i.test(haystack)) {
        return {
            provider: "Google Analytics",
            identifier: getQueryId(src ?? "") ?? matchIdentifier(haystack, /(?:G|UA|AW)-[A-Z0-9-]+/i),
        };
    }
    if (lower.includes("connect.facebook.net") || lower.includes("fbq(")) {
        return {
            provider: "Meta Pixel",
            identifier: matchIdentifier(haystack, /fbq\(\s*['"]init['"]\s*,\s*['"]([^'"]+)['"]/i),
        };
    }
    if (lower.includes("analytics.tiktok.com") || lower.includes("ttq.load")) {
        return {
            provider: "TikTok Pixel",
            identifier: matchIdentifier(haystack, /ttq\.load\(\s*['"]([^'"]+)['"]/i),
        };
    }
    if (lower.includes("static.hotjar.com") || lower.includes("hjid")) {
        return {
            provider: "Hotjar",
            identifier: matchIdentifier(haystack, /hjid\s*:\s*(\d+)/i),
        };
    }
    if (lower.includes("clarity.ms/tag") || lower.includes("clarity(")) {
        return {
            provider: "Microsoft Clarity",
            identifier: matchIdentifier(haystack, /clarity\.ms\/tag\/([A-Za-z0-9]+)/i),
        };
    }
    return { provider: null, identifier: null };
};
const addDuplicateWarnings = (scripts) => {
    const warnings = [];
    const bySrc = new Map();
    const byProviderId = new Map();
    for (const script of scripts) {
        if (script.src) {
            bySrc.set(script.src, [...(bySrc.get(script.src) ?? []), script.index]);
        }
        if (script.provider && script.identifier) {
            const key = `${script.provider}\u0000${script.identifier}`;
            byProviderId.set(key, [...(byProviderId.get(key) ?? []), script.index]);
        }
    }
    for (const indexes of bySrc.values()) {
        if (indexes.length > 1) {
            warnings.push({
                code: "duplicate_src",
                message: "External script src appears more than once.",
                scriptIndexes: indexes,
            });
        }
    }
    for (const indexes of byProviderId.values()) {
        if (indexes.length > 1) {
            warnings.push({
                code: "duplicate_provider_id",
                message: "Provider identifier appears more than once.",
                scriptIndexes: indexes,
            });
        }
    }
    return warnings;
};
const analyzeTracking = (htmlInput) => {
    const html = ensureHtml(htmlInput);
    const $ = cheerio.load(html);
    const scripts = $("script")
        .toArray()
        .map((element, index) => {
        const src = $(element).attr("src") ?? null;
        const content = $(element).text();
        const detected = detectProvider(src, content);
        return {
            index,
            src,
            inline: src == null,
            provider: detected.provider,
            identifier: detected.identifier,
            location: getLocation($, element),
        };
    });
    const warnings = addDuplicateWarnings(scripts);
    return {
        scripts,
        summary: {
            totalScripts: scripts.length,
            externalScripts: scripts.filter((script) => !script.inline).length,
            inlineScripts: scripts.filter((script) => script.inline).length,
            detectedProviders: new Set(scripts
                .map((script) => script.provider)
                .filter((provider) => provider != null)).size,
            warnings: warnings.length,
        },
        warnings,
    };
};
exports.analyzeTracking = analyzeTracking;
