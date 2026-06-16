import { lookup } from "dns/promises";
import net from "net";
import {
  FetchLike,
  FetchLikeResponse,
  InspectUrlsResponse,
  ResolveHost,
  UrlInspectionResult,
  UrlRedirectHop,
} from "./types";

export const ERROR_MESSAGES = {
  invalidUrls: "Invalid urls. Expected array of strings.",
  tooManyUrls: "Too many URLs. Maximum is 50.",
  invalidUrl: "Invalid URL.",
  invalidProtocol: "Only http and https URLs are allowed.",
  blockedUrl: "Blocked internal or private URL.",
  tooManyRedirects: "Too many redirects.",
  requestTimedOut: "Request timed out.",
  requestFailed: "Request failed.",
} as const;

const MAX_URLS = 50;
const MAX_URL_LENGTH = 2048;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const REDIRECT_STATUSES = new Set([300, 301, 302, 303, 307, 308]);

const defaultFetch: FetchLike = async (url, init) => {
  const response = await fetch(url, init);
  return {
    status: response.status,
    url: response.url,
    headers: response.headers,
  };
};

const defaultResolveHost: ResolveHost = async (hostname) => {
  return lookup(hostname, { all: true });
};

const ensureUrls = (urls: unknown): string[] => {
  if (
    !Array.isArray(urls) ||
    urls.some((url) => typeof url !== "string")
  ) {
    throw new Error(ERROR_MESSAGES.invalidUrls);
  }

  if (urls.length > MAX_URLS) {
    throw new Error(ERROR_MESSAGES.tooManyUrls);
  }

  return urls;
};

const parseIPv4 = (address: string): number[] | null => {
  const parts = address.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const octets = parts.map((part) => Number(part));
  if (
    octets.some(
      (octet, index) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255 ||
        String(octet) !== parts[index],
    )
  ) {
    return null;
  }

  return octets;
};

const isPrivateIPv4 = (address: string): boolean => {
  const octets = parseIPv4(address);
  if (!octets) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const isPrivateIPv6 = (address: string): boolean => {
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
};

const isBlockedIp = (address: string): boolean => {
  const version = net.isIP(address);

  if (version === 4) {
    return isPrivateIPv4(address);
  }

  if (version === 6) {
    return isPrivateIPv6(address);
  }

  return false;
};

const validateSafeUrl = async (
  urlInput: string,
  resolveHost: ResolveHost,
): Promise<URL> => {
  if (urlInput.length > MAX_URL_LENGTH) {
    throw new Error(ERROR_MESSAGES.invalidUrl);
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(urlInput);
  } catch {
    throw new Error(ERROR_MESSAGES.invalidUrl);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(ERROR_MESSAGES.invalidProtocol);
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error(ERROR_MESSAGES.blockedUrl);
  }

  if (net.isIP(hostname) !== 0) {
    if (isBlockedIp(hostname)) {
      throw new Error(ERROR_MESSAGES.blockedUrl);
    }

    return parsedUrl;
  }

  const addresses = await resolveHost(hostname);
  if (addresses.some(({ address }) => isBlockedIp(address))) {
    throw new Error(ERROR_MESSAGES.blockedUrl);
  }

  return parsedUrl;
};

const withTimeout = async (
  url: string,
  method: "HEAD" | "GET",
  fetcher: FetchLike,
): Promise<FetchLikeResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetcher(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(ERROR_MESSAGES.requestTimedOut);
    }

    throw new Error(ERROR_MESSAGES.requestFailed);
  } finally {
    clearTimeout(timeout);
  }
};

const requestUrl = async (
  url: string,
  fetcher: FetchLike,
): Promise<FetchLikeResponse> => {
  return withTimeout(url, "GET", fetcher);
};

const createErrorResult = (
  index: number,
  inputUrl: string,
  error: string,
  redirects: UrlRedirectHop[] = [],
  finalUrl: string | null = null,
  statusCode: number | null = null,
): UrlInspectionResult => ({
  index,
  inputUrl,
  finalUrl,
  statusCode,
  ok: false,
  redirects,
  error,
});

const inspectSingleUrl = async (
  inputUrl: string,
  index: number,
  fetcher: FetchLike,
  resolveHost: ResolveHost,
): Promise<UrlInspectionResult> => {
  const redirects: UrlRedirectHop[] = [];
  let currentUrl: URL;

  try {
    currentUrl = await validateSafeUrl(inputUrl, resolveHost);
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.invalidUrl;
    return createErrorResult(index, inputUrl, message);
  }

  while (true) {
    let response: FetchLikeResponse;

    try {
      response = await requestUrl(currentUrl.toString(), fetcher);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : ERROR_MESSAGES.requestFailed;
      return createErrorResult(
        index,
        inputUrl,
        message,
        redirects,
        currentUrl.toString(),
      );
    }

    const location = response.headers.get("location");

    if (REDIRECT_STATUSES.has(response.status) && location) {
      if (redirects.length >= MAX_REDIRECTS) {
        return createErrorResult(
          index,
          inputUrl,
          ERROR_MESSAGES.tooManyRedirects,
          redirects,
          currentUrl.toString(),
          response.status,
        );
      }

      const nextUrlInput = new URL(location, currentUrl).toString();

      let nextUrl: URL;
      try {
        nextUrl = await validateSafeUrl(nextUrlInput, resolveHost);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : ERROR_MESSAGES.blockedUrl;
        redirects.push({
          from: currentUrl.toString(),
          to: nextUrlInput,
          statusCode: response.status,
        });
        return createErrorResult(
          index,
          inputUrl,
          message,
          redirects,
          currentUrl.toString(),
          response.status,
        );
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
      error: ok ? null : ERROR_MESSAGES.requestFailed,
    };
  }
};

export const inspectUrls = async (
  urlsInput: unknown,
  options: {
    fetcher?: FetchLike;
    resolveHost?: ResolveHost;
  } = {},
): Promise<InspectUrlsResponse> => {
  const urls = ensureUrls(urlsInput);
  const fetcher = options.fetcher ?? defaultFetch;
  const resolveHost = options.resolveHost ?? defaultResolveHost;
  const results: UrlInspectionResult[] = [];

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
      blocked: results.filter(
        (result) => result.error === ERROR_MESSAGES.blockedUrl,
      ).length,
    },
  };
};
