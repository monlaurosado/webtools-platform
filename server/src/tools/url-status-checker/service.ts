import { lookup } from "dns/promises";
import net from "node:net";
import { fetchPublicHeaders, isBlockedAddress } from "../../network/safe-request";
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
  busy: "URL checker is busy. Please try again shortly.",
} as const;

const MAX_URLS = 50;
const MAX_URL_LENGTH = 2048;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const REDIRECT_STATUSES = new Set([300, 301, 302, 303, 307, 308]);

const DNS_TIMEOUT_MS = 5_000;
const BATCH_TIMEOUT_MS = 30_000;
const MAX_CONCURRENT_BATCHES = 4;
const URL_WORKERS = 4;
let activeBatches = 0;

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

type SafeTarget = { url: URL; addresses: Awaited<ReturnType<ResolveHost>> };

const abortable = <T>(promise: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error(ERROR_MESSAGES.requestTimedOut));
    };
    if (signal.aborted) { onAbort(); return; }
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });

const validateSafeUrl = async (
  urlInput: string,
  resolveHost: ResolveHost,
  signal: AbortSignal,
): Promise<SafeTarget> => {
  if (urlInput.length > MAX_URL_LENGTH) throw new Error(ERROR_MESSAGES.invalidUrl);
  let url: URL;
  try { url = new URL(urlInput); }
  catch { throw new Error(ERROR_MESSAGES.invalidUrl); }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(ERROR_MESSAGES.invalidProtocol);
  }
  if (url.username || url.password) throw new Error(ERROR_MESSAGES.blockedUrl);
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error(ERROR_MESSAGES.blockedUrl);
  }
  const family = net.isIP(hostname);
  let addresses: SafeTarget["addresses"];
  if (family) addresses = [{ address: hostname, family }];
  else {
    const dnsController = new AbortController();
    const onAbort = () => dnsController.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) dnsController.abort();
    const timeout = setTimeout(() => dnsController.abort(), DNS_TIMEOUT_MS);
    try { addresses = await abortable(resolveHost(hostname), dnsController.signal); }
    catch (error) {
      if (error instanceof Error && error.message === ERROR_MESSAGES.requestTimedOut) throw error;
      throw new Error(ERROR_MESSAGES.requestFailed);
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
    }
  }
  if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error(ERROR_MESSAGES.blockedUrl);
  }
  return { url, addresses };
};

const requestUrl = async (
  target: SafeTarget,
  fetcher: FetchLike,
  signal: AbortSignal,
): Promise<FetchLikeResponse> => {
  try {
    return await abortable(fetcher(target.url.toString(), {
      method: "GET", redirect: "manual", signal, addresses: target.addresses,
    }), signal);
  } catch (error) {
    if (signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new Error(ERROR_MESSAGES.requestTimedOut);
    }
    throw new Error(ERROR_MESSAGES.requestFailed);
  }
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
  signal: AbortSignal,
): Promise<UrlInspectionResult> => {
  const redirects: UrlRedirectHop[] = [];
  let target: SafeTarget;

  try {
    target = await validateSafeUrl(inputUrl, resolveHost, signal);
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.invalidUrl;
    return createErrorResult(index, inputUrl, message);
  }

  while (true) {
    let response: FetchLikeResponse;

    try {
      response = await requestUrl(target, fetcher, signal);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : ERROR_MESSAGES.requestFailed;
      return createErrorResult(
        index,
        inputUrl,
        message,
        redirects,
        target.url.toString(),
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
          target.url.toString(),
          response.status,
        );
      }

      let nextUrlInput = location;
      let nextTarget: SafeTarget;
      try {
        nextUrlInput = new URL(location, target.url).toString();
        nextTarget = await validateSafeUrl(nextUrlInput, resolveHost, signal);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : ERROR_MESSAGES.blockedUrl;
        redirects.push({
          from: target.url.toString(),
          to: nextUrlInput,
          statusCode: response.status,
        });
        return createErrorResult(
          index,
          inputUrl,
          message,
          redirects,
          target.url.toString(),
          response.status,
        );
      }

      redirects.push({
        from: target.url.toString(),
        to: nextTarget.url.toString(),
        statusCode: response.status,
      });
      target = nextTarget;
      continue;
    }

    const ok = response.status >= 200 && response.status < 300;

    return {
      index,
      inputUrl,
      finalUrl: target.url.toString(),
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
  const fetcher = options.fetcher ?? fetchPublicHeaders;
  const resolveHost = options.resolveHost ?? defaultResolveHost;
  if (activeBatches >= MAX_CONCURRENT_BATCHES) throw new Error(ERROR_MESSAGES.busy);
  activeBatches += 1;
  const results: UrlInspectionResult[] = new Array(urls.length);
  const deadline = Date.now() + BATCH_TIMEOUT_MS;
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < urls.length) {
      const index = nextIndex++;
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        results[index] = createErrorResult(index, urls[index], ERROR_MESSAGES.requestTimedOut);
        continue;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.min(REQUEST_TIMEOUT_MS, remaining));
      try {
        results[index] = await inspectSingleUrl(urls[index], index, fetcher, resolveHost, controller.signal);
      } finally { clearTimeout(timeout); }
    }
  };
  try { await Promise.all(Array.from({ length: Math.min(URL_WORKERS, urls.length) }, worker)); }
  finally { activeBatches -= 1; }

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
