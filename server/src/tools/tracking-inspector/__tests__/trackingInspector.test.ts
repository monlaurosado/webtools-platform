import { describe, expect, it } from "vitest";
import {
  ERROR_MESSAGES,
  MAX_HTML_BYTES,
  analyzeTracking,
} from "../service";

describe("analyzeTracking", () => {
  it("rejects non-string html", () => {
    expect(() => analyzeTracking(123)).toThrow(ERROR_MESSAGES.invalidHtml);
  });

  it("rejects HTML larger than 1 MB", () => {
    expect(() => analyzeTracking("x".repeat(MAX_HTML_BYTES + 1))).toThrow(
      ERROR_MESSAGES.htmlTooLarge,
    );
  });

  it("returns empty scripts when there are no scripts", () => {
    const result = analyzeTracking("<main>No scripts</main>");

    expect(result.scripts).toEqual([]);
    expect(result.summary.totalScripts).toBe(0);
  });

  it("detects external scripts", () => {
    const result = analyzeTracking(
      '<html><head><script src="https://cdn.example.com/app.js"></script></head></html>',
    );

    expect(result.scripts[0]).toMatchObject({
      index: 0,
      src: "https://cdn.example.com/app.js",
      inline: false,
      provider: null,
      identifier: null,
      location: "head",
    });
  });

  it("detects Google Tag Manager", () => {
    const result = analyzeTracking(
      '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>',
    );

    expect(result.scripts[0]).toMatchObject({
      provider: "Google Tag Manager",
      identifier: "GTM-ABC123",
    });
  });

  it("detects Google Analytics gtag", () => {
    const result = analyzeTracking(
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>',
    );

    expect(result.scripts[0]).toMatchObject({
      provider: "Google Analytics",
      identifier: "G-ABC123",
    });
  });

  it("detects Meta Pixel inline", () => {
    const result = analyzeTracking("<script>fbq('init', '123456789');</script>");

    expect(result.scripts[0]).toMatchObject({
      provider: "Meta Pixel",
      identifier: "123456789",
      inline: true,
    });
  });

  it("detects TikTok Pixel inline", () => {
    const result = analyzeTracking("<script>ttq.load('ABC123');</script>");

    expect(result.scripts[0]).toMatchObject({
      provider: "TikTok Pixel",
      identifier: "ABC123",
    });
  });

  it("detects Hotjar", () => {
    const result = analyzeTracking("<script>var hjid = 12345; hjid:12345;</script>");

    expect(result.scripts[0]).toMatchObject({
      provider: "Hotjar",
      identifier: "12345",
    });
  });

  it("detects Microsoft Clarity", () => {
    const result = analyzeTracking(
      '<script src="https://www.clarity.ms/tag/abcdef"></script>',
    );

    expect(result.scripts[0]).toMatchObject({
      provider: "Microsoft Clarity",
      identifier: "abcdef",
    });
  });

  it("detects duplicate src", () => {
    const result = analyzeTracking(
      '<script src="https://cdn.example.com/app.js"></script>' +
        '<script src="https://cdn.example.com/app.js"></script>',
    );

    expect(result.warnings).toContainEqual({
      code: "duplicate_src",
      message: "External script src appears more than once.",
      scriptIndexes: [0, 1],
    });
  });

  it("detects duplicate provider identifier", () => {
    const result = analyzeTracking(
      '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>' +
        "<script>GTM-ABC123</script>",
    );

    expect(result.warnings).toContainEqual({
      code: "duplicate_provider_id",
      message: "Provider identifier appears more than once.",
      scriptIndexes: [0, 1],
    });
  });

  it("calculates summary", () => {
    const result = analyzeTracking(
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>' +
        "<script>fbq('init', '123');</script>",
    );

    expect(result.summary).toEqual({
      totalScripts: 2,
      externalScripts: 1,
      inlineScripts: 1,
      detectedProviders: 2,
      warnings: 0,
    });
  });
});
