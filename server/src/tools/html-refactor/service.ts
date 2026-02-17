import * as cheerio from "cheerio";
import { HtmlAttribute, VALID_ATTRIBUTES } from "./types";

export const ERROR_MESSAGES = {
  invalidAttribute: "Invalid attribute. Allowed: href, src.",
  invalidHtml: "Invalid html. Expected string.",
  invalidReplacements: "Invalid replacements. Expected object map.",
  invalidReplacementValue: "Invalid replacements. Values must be strings.",
} as const;

const VALID_ATTRIBUTE_SET = new Set<string>(VALID_ATTRIBUTES);

const HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;

const isDocumentHtml = (html: string): boolean => {
  const lower = html.toLowerCase();
  return lower.includes("<!doctype") || lower.includes("<html");
};

const loadHtml = (html: string): { $: cheerio.CheerioAPI; isDocument: boolean } => {
  const isDocument = isDocumentHtml(html);
  const $ = cheerio.load(html, { decodeEntities: false }, isDocument);
  return { $, isDocument };
};

const serializeHtml = (api: cheerio.CheerioAPI, isDocument: boolean): string => {
  if (isDocument) {
    return api.html();
  }
  return api.root().html() ?? "";
};

const ensureHtml = (html: unknown): string => {
  if (typeof html !== "string") {
    throw new Error(ERROR_MESSAGES.invalidHtml);
  }
  return html;
};

const ensureAttribute = (attribute: unknown): HtmlAttribute => {
  if (typeof attribute !== "string" || !VALID_ATTRIBUTE_SET.has(attribute)) {
    throw new Error(ERROR_MESSAGES.invalidAttribute);
  }
  return attribute as HtmlAttribute;
};

const ensureReplacements = (replacements: unknown): Record<string, string> => {
  if (!replacements || typeof replacements !== "object" || Array.isArray(replacements)) {
    throw new Error(ERROR_MESSAGES.invalidReplacements);
  }

  const record = replacements as Record<string, unknown>;
  for (const value of Object.values(record)) {
    if (typeof value !== "string") {
      throw new Error(ERROR_MESSAGES.invalidReplacementValue);
    }
  }

  return record as Record<string, string>;
};

export const extractAttributeValues = (
  htmlInput: unknown,
  attributeInput: unknown,
): string[] => {
  const html = ensureHtml(htmlInput);
  const attribute = ensureAttribute(attributeInput);
  const { $ } = loadHtml(html);
  const values: string[] = [];
  const seen = new Set<string>();

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

export const replaceAttributeValues = (
  htmlInput: unknown,
  attributeInput: unknown,
  replacementsInput: unknown,
): string => {
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
