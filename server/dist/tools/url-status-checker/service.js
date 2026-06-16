"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectUrls = exports.ERROR_MESSAGES = void 0;
const promises_1 = require("dns/promises");
const net_1 = __importDefault(require("net"));
exports.ERROR_MESSAGES = {
    invalidUrls: "Invalid urls. Expected array of strings.",
    tooManyUrls: "Too many URLs. Maximum is 50.",
    invalidUrl: "Invalid URL.",
    invalidProtocol: "Only http and https URLs are allowed.",
    blockedUrl: "Blocked internal or private URL.",
    tooManyRedirects: "Too many redirects.",
    requestTimedOut: "Request timed out.",
    requestFailed: "Request failed.",
};
const MAX_URLS = 50;
const MAX_URL_LENGTH = 2048;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 10000;
const REDIRECT_STATUSES = new Set([300, 301, 302, 303, 307, 308]);
const defaultFetch = async (url, init) => {
    const response = await fetch(url, init);
    return {
        status: response.status,
        url: response.url,
        headers: response.headers,
    };
};
const defaultResolveHost = async (hostname) => {
    return (0, promises_1.lookup)(hostname, { all: true });
};
const ensureUrls = (urls) => {
    if (!Array.isArray(urls) ||
        urls.some((url) => typeof url !== "string")) {
        throw new Error(exports.ERROR_MESSAGES.invalidUrls);
    }
    if (urls.length > MAX_URLS) {
        throw new Error(exports.ERROR_MESSAGES.tooManyUrls);
    }
    return urls;
};
const parseIPv4 = (address) => {
    const parts = address.split(".");
    if (parts.length !== 4) {
        return null;
    }
    const octets = parts.map((part) => Number(part));
    if (octets.some((octet, index) => !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255 ||
        String(octet) !== parts[index])) {
        return null;
    }
    return octets;
};
const isPrivateIPv4 = (address) => {
    const octets = parseIPv4(address);
    if (!octets) {
        return false;
    }
    const [first, second] = octets;
    return (first === 0 ||
        first === 10 ||
        first === 127 ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168));
};
const isPrivateIPv6 = (address) => {
    const normalized = address.toLowerCase();
    return (normalized === "::1" ||
        normalized === "0:0:0:0:0:0:0:1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe8") ||
        normalized.startsWith("fe9") ||
        normalized.startsWith("fea") ||
        normalized.startsWith("feb"));
};
const isBlockedIp = (address) => {
    const version = net_1.default.isIP(address);
    if (version === 4) {
        return isPrivateIPv4(address);
    }
    if (version === 6) {
        return isPrivateIPv6(address);
    }
    return false;
};
const validateSafeUrl = async (urlInput, resolveHost) => {
    if (urlInput.length > MAX_URL_LENGTH) {
        throw new Error(exports.ERROR_MESSAGES.invalidUrl);
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(urlInput);
    }
    catch {
        throw new Error(exports.ERROR_MESSAGES.invalidUrl);
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error(exports.ERROR_MESSAGES.invalidProtocol);
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
        throw new Error(exports.ERROR_MESSAGES.blockedUrl);
    }
    if (net_1.default.isIP(hostname) !== 0) {
        if (isBlockedIp(hostname)) {
            throw new Error(exports.ERROR_MESSAGES.blockedUrl);
        }
        return parsedUrl;
    }
    const addresses = await resolveHost(hostname);
    if (addresses.some(({ address }) => isBlockedIp(address))) {
        throw new Error(exports.ERROR_MESSAGES.blockedUrl);
    }
    return parsedUrl;
};
const withTimeout = async (url, method, fetcher) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetcher(url, {
            method,
            redirect: "manual",
            signal: controller.signal,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(exports.ERROR_MESSAGES.requestTimedOut);
        }
        throw new Error(exports.ERROR_MESSAGES.requestFailed);
    }
    finally {
        clearTimeout(timeout);
    }
};
const requestUrl = async (url, fetcher) => {
    return withTimeout(url, "GET", fetcher);
};
const createErrorResult = (index, inputUrl, error, redirects = [], finalUrl = null, statusCode = null) => ({
    index,
    inputUrl,
    finalUrl,
    statusCode,
    ok: false,
    redirects,
    error,
});
const inspectSingleUrl = async (inputUrl, index, fetcher, resolveHost) => {
    const redirects = [];
    let currentUrl;
    try {
        currentUrl = await validateSafeUrl(inputUrl, resolveHost);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : exports.ERROR_MESSAGES.invalidUrl;
        return createErrorResult(index, inputUrl, message);
    }
    while (true) {
        let response;
        try {
            response = await requestUrl(currentUrl.toString(), fetcher);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : exports.ERROR_MESSAGES.requestFailed;
            return createErrorResult(index, inputUrl, message, redirects, currentUrl.toString());
        }
        const location = response.headers.get("location");
        if (REDIRECT_STATUSES.has(response.status) && location) {
            if (redirects.length >= MAX_REDIRECTS) {
                return createErrorResult(index, inputUrl, exports.ERROR_MESSAGES.tooManyRedirects, redirects, currentUrl.toString(), response.status);
            }
            const nextUrlInput = new URL(location, currentUrl).toString();
            let nextUrl;
            try {
                nextUrl = await validateSafeUrl(nextUrlInput, resolveHost);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : exports.ERROR_MESSAGES.blockedUrl;
                redirects.push({
                    from: currentUrl.toString(),
                    to: nextUrlInput,
                    statusCode: response.status,
                });
                return createErrorResult(index, inputUrl, message, redirects, currentUrl.toString(), response.status);
            }
            redirects.push({
                from: currentUrl.toString(),
                to: nextUrl.toString(),
                statusCode: response.status,
            });
            currentUrl = nextUrl;
            continue;
        }
        const ok = response.status >= 200 && response.status < 300;
        return {
            index,
            inputUrl,
            finalUrl: currentUrl.toString(),
            statusCode: response.status,
            ok,
            redirects,
            error: ok ? null : exports.ERROR_MESSAGES.requestFailed,
        };
    }
};
const inspectUrls = async (urlsInput, options = {}) => {
    const urls = ensureUrls(urlsInput);
    const fetcher = options.fetcher ?? defaultFetch;
    const resolveHost = options.resolveHost ?? defaultResolveHost;
    const results = [];
    for (const [index, url] of urls.entries()) {
        results.push(await inspectSingleUrl(url, index, fetcher, resolveHost));
    }
    return {
        results,
        summary: {
            total: results.length,
            ok: results.filter((result) => result.ok).length,
            redirected: results.filter((result) => result.redirects.length > 0).length,
            failed: results.filter((result) => result.error != null || !result.ok).length,
            blocked: results.filter((result) => result.error === exports.ERROR_MESSAGES.blockedUrl).length,
        },
    };
};
exports.inspectUrls = inspectUrls;
