import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import {
  AnalyzeTrackingResponse,
  ScriptLocation,
  TrackingScript,
  TrackingWarning,
} from "./types";

export const MAX_HTML_BYTES = 1024 * 1024;

export const ERROR_MESSAGES = {
  invalidHtml: "Invalid html. Expected string.",
  htmlTooLarge: "HTML input exceeds the 1 MB limit.",
} as const;

const ensureHtml = (html: unknown): string => {
  if (typeof html !== "string") {
    throw new Error(ERROR_MESSAGES.invalidHtml);
  }

  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    throw new Error(ERROR_MESSAGES.htmlTooLarge);
  }

  return html;
};

const getLocation = ($: cheerio.CheerioAPI, element: Element): ScriptLocation => {
  if ($(element).parents("head").length > 0) {
    return "head";
  }

  if ($(element).parents("body").length > 0) {
    return "body";
  }

  return "unknown";
};

const getQueryId = (src: string): string | null => {
  try {
    return new URL(src).searchParams.get("id");
  } catch {
    return null;
  }
};

const matchIdentifier = (value: string, pattern: RegExp): string | null => {
  const match = value.match(pattern);
  return match?.[1] ?? match?.[0] ?? null;
};

const detectProvider = (
  src: string | null,
  content: string,
): { provider: string | null; identifier: string | null } => {
  const haystack = `${src ?? ""}\n${content}`;
  const lower = haystack.toLowerCase();

  if (lower.includes("googletagmanager.com/gtm.js") || /GTM-[A-Z0-9]+/i.test(haystack)) {
    return {
      provider: "Google Tag Manager",
      identifier: getQueryId(src ?? "") ?? matchIdentifier(haystack, /GTM-[A-Z0-9]+/i),
    };
  }

  if (
    lower.includes("googletagmanager.com/gtag/js") ||
    /(?:G|UA|AW)-[A-Z0-9-]+/i.test(haystack)
  ) {
    return {
      provider: "Google Analytics",
      identifier:
        getQueryId(src ?? "") ?? matchIdentifier(haystack, /(?:G|UA|AW)-[A-Z0-9-]+/i),
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

const addDuplicateWarnings = (scripts: TrackingScript[]): TrackingWarning[] => {
  const warnings: TrackingWarning[] = [];
  const bySrc = new Map<string, number[]>();
  const byProviderId = new Map<string, number[]>();

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

export const analyzeTracking = (htmlInput: unknown): AnalyzeTrackingResponse => {
  const html = ensureHtml(htmlInput);
  const $ = cheerio.load(html);

  const scripts: TrackingScript[] = $("script")
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
      detectedProviders: new Set(
        scripts
          .map((script) => script.provider)
          .filter((provider): provider is string => provider != null),
      ).size,
      warnings: warnings.length,
    },
    warnings,
  };
};
