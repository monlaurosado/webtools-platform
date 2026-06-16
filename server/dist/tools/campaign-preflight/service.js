"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCampaignPreflight = exports.ERROR_MESSAGES = void 0;
const service_1 = require("../form-inspector/service");
const service_2 = require("../tracking-inspector/service");
const service_3 = require("../url-status-checker/service");
exports.ERROR_MESSAGES = {
    invalidHtml: "Invalid html. Expected string.",
    invalidUrls: "Invalid urls. Expected array of strings.",
};
const ensureHtml = (html) => {
    if (typeof html !== "string") {
        throw new Error(exports.ERROR_MESSAGES.invalidHtml);
    }
    return html;
};
const ensureUrls = (urls) => {
    if (urls == null) {
        return [];
    }
    if (!Array.isArray(urls) ||
        urls.some((url) => typeof url !== "string")) {
        throw new Error(exports.ERROR_MESSAGES.invalidUrls);
    }
    return urls;
};
const getRiskLevel = (score) => {
    if (score >= 85) {
        return "low";
    }
    if (score >= 60) {
        return "medium";
    }
    return "high";
};
const runCampaignPreflight = async (htmlInput, urlsInput, options = {}) => {
    const html = ensureHtml(htmlInput);
    const urls = ensureUrls(urlsInput);
    const forms = (0, service_1.analyzeForms)(html);
    const tracking = (0, service_2.analyzeTracking)(html);
    const urlResults = await (0, service_3.inspectUrls)(urls, options);
    const formWarnings = forms.forms.reduce((total, form) => total + form.warnings.length, 0);
    const trackingWarnings = tracking.warnings.length;
    const urlFailures = urlResults.results.filter((result) => result.error != null || !result.ok).length;
    const warnings = [];
    forms.forms.forEach((form) => {
        form.warnings.forEach((warning) => {
            warnings.push({
                area: "forms",
                code: warning.code,
                message: `Form ${form.index + 1}: ${warning.message}`,
            });
        });
    });
    tracking.warnings.forEach((warning) => {
        warnings.push({
            area: "tracking",
            code: warning.code,
            message: warning.message,
        });
    });
    urlResults.results.forEach((result) => {
        if (result.error || !result.ok) {
            warnings.push({
                area: "urls",
                code: result.error ?? "http_status_failure",
                message: `${result.inputUrl}: ${result.error ?? `Status ${result.statusCode}`}`,
            });
        }
    });
    if (forms.forms.length === 0) {
        warnings.push({
            area: "general",
            code: "no_forms",
            message: "No forms were detected in the HTML.",
        });
    }
    if (tracking.summary.detectedProviders === 0) {
        warnings.push({
            area: "general",
            code: "no_tracking",
            message: "No supported tracking providers were detected.",
        });
    }
    const score = Math.max(0, 100 -
        formWarnings * 8 -
        trackingWarnings * 6 -
        urlFailures * 10 -
        (forms.forms.length === 0 ? 10 : 0) -
        (tracking.summary.detectedProviders === 0 ? 8 : 0));
    return {
        score,
        riskLevel: getRiskLevel(score),
        summary: {
            forms: forms.forms.length,
            formWarnings,
            scripts: tracking.summary.totalScripts,
            trackingWarnings,
            urls: urlResults.summary.total,
            urlFailures,
        },
        checks: {
            forms,
            tracking,
            urls: urlResults,
        },
        warnings,
    };
};
exports.runCampaignPreflight = runCampaignPreflight;
