import { analyzeForms } from "../form-inspector/service";
import { analyzeTracking } from "../tracking-inspector/service";
import { inspectUrls } from "../url-status-checker/service";
import { FetchLike, ResolveHost } from "../url-status-checker/types";
import {
  CampaignPreflightResponse,
  CampaignPreflightWarning,
  CampaignRiskLevel,
} from "./types";

export const ERROR_MESSAGES = {
  invalidHtml: "Invalid html. Expected string.",
  invalidUrls: "Invalid urls. Expected array of strings.",
} as const;

const ensureHtml = (html: unknown): string => {
  if (typeof html !== "string") {
    throw new Error(ERROR_MESSAGES.invalidHtml);
  }
  return html;
};

const ensureUrls = (urls: unknown): string[] => {
  if (urls == null) {
    return [];
  }

  if (
    !Array.isArray(urls) ||
    urls.some((url) => typeof url !== "string")
  ) {
    throw new Error(ERROR_MESSAGES.invalidUrls);
  }

  return urls;
};

const getRiskLevel = (score: number): CampaignRiskLevel => {
  if (score >= 85) {
    return "low";
  }

  if (score >= 60) {
    return "medium";
  }

  return "high";
};

export const runCampaignPreflight = async (
  htmlInput: unknown,
  urlsInput: unknown,
  options: {
    fetcher?: FetchLike;
    resolveHost?: ResolveHost;
  } = {},
): Promise<CampaignPreflightResponse> => {
  const html = ensureHtml(htmlInput);
  const urls = ensureUrls(urlsInput);
  const forms = analyzeForms(html);
  const tracking = analyzeTracking(html);
  const urlResults = await inspectUrls(urls, options);
  const formWarnings = forms.forms.reduce(
    (total, form) => total + form.warnings.length,
    0,
  );
  const trackingWarnings = tracking.warnings.length;
  const urlFailures = urlResults.results.filter(
    (result) => result.error != null || !result.ok,
  ).length;
  const warnings: CampaignPreflightWarning[] = [];

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

  const score = Math.max(
    0,
    100 -
      formWarnings * 8 -
      trackingWarnings * 6 -
      urlFailures * 10 -
      (forms.forms.length === 0 ? 10 : 0) -
      (tracking.summary.detectedProviders === 0 ? 8 : 0),
  );

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
