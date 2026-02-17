import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";
import {
  ERROR_MESSAGES,
  extractAttributeValues,
  replaceAttributeValues,
} from "./service";

describe("extractAttributeValues", () => {
  it("extracts unique values in order and ignores empty attributes", () => {
    const html =
      '<a href="https://a.com">A</a>' +
      '<a href="https://b.com">B</a>' +
      '<a href="https://a.com">C</a>' +
      '<a href=""></a>' +
      "<a>No href</a>";

    const values = extractAttributeValues(html, "href");

    expect(values).toEqual(["https://a.com", "https://b.com"]);
  });

  it("extracts src attributes across elements", () => {
    const html =
      '<img src="img-1.png">' +
      '<script src="app.js"></script>' +
      '<img src="img-1.png">';

    const values = extractAttributeValues(html, "src");

    expect(values).toEqual(["img-1.png", "app.js"]);
  });

  it("throws on invalid attribute", () => {
    expect(() => extractAttributeValues("<a></a>", "data-test")).toThrow(
      ERROR_MESSAGES.invalidAttribute,
    );
  });

  it("throws on invalid html input", () => {
    expect(() => extractAttributeValues(123, "href")).toThrow(
      ERROR_MESSAGES.invalidHtml,
    );
  });
});

describe("replaceAttributeValues", () => {
  it("replaces exact matches only for the requested attribute", () => {
    const html =
      '<a href="https://a.com">A</a>' +
      '<a href="https://a.com/extra">B</a>' +
      '<img src="https://a.com">';

    const result = replaceAttributeValues(html, "href", {
      "https://a.com": "https://b.com",
    });

    const $ = cheerio.load(result, { decodeEntities: false }, false);
    expect($("a").eq(0).attr("href")).toBe("https://b.com");
    expect($("a").eq(1).attr("href")).toBe("https://a.com/extra");
    expect($("img").attr("src")).toBe("https://a.com");
  });

  it("returns the original html when no replacements are applied", () => {
    const html = '<a href="https://a.com">A</a>';

    const result = replaceAttributeValues(html, "href", {
      "https://b.com": "https://c.com",
    });

    expect(result).toBe(html);
  });

  it("preserves document structure when input is a full document", () => {
    const html =
      "<!doctype html>" +
      '<html><head><title>Test</title></head>' +
      '<body><a href="https://a.com">A</a></body></html>';

    const result = replaceAttributeValues(html, "href", {
      "https://a.com": "https://b.com",
    });

    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<html>");
    expect(result).toContain("</html>");
    expect(result).toContain('href="https://b.com"');
  });

  it("throws on invalid replacements input", () => {
    expect(() =>
      replaceAttributeValues("<a></a>", "href", null),
    ).toThrow(ERROR_MESSAGES.invalidReplacements);
  });

  it("throws when replacements contain non-string values", () => {
    expect(() =>
      replaceAttributeValues("<a></a>", "href", { test: 123 }),
    ).toThrow(ERROR_MESSAGES.invalidReplacementValue);
  });
});
