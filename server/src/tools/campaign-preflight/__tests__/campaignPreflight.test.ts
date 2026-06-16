import { describe, expect, it } from "vitest";
import { FetchLike, ResolveHost } from "../../url-status-checker/types";
import { ERROR_MESSAGES, runCampaignPreflight } from "../service";

const publicResolver: ResolveHost = async () => [
  { address: "93.184.216.34", family: 4 },
];

const okFetch: FetchLike = async () => ({
  status: 200,
  headers: {
    get() {
      return null;
    },
  },
});

const goodHtml =
  '<form action="/lead" method="post"><input name="email"><button></button></form>' +
  '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>';

describe("runCampaignPreflight", () => {
  it("rejects non-string html", async () => {
    await expect(runCampaignPreflight(123, [])).rejects.toThrow(
      ERROR_MESSAGES.invalidHtml,
    );
  });

  it("rejects non-array urls when provided", async () => {
    await expect(runCampaignPreflight(goodHtml, "https://example.com")).rejects.toThrow(
      ERROR_MESSAGES.invalidUrls,
    );
  });

  it("aggregates Form Inspector", async () => {
    const result = await runCampaignPreflight(goodHtml, [], {
      fetcher: okFetch,
      resolveHost: publicResolver,
    });

    expect(result.checks.forms.forms).toHaveLength(1);
    expect(result.summary.forms).toBe(1);
  });

  it("aggregates Tracking Inspector", async () => {
    const result = await runCampaignPreflight(goodHtml, [], {
      fetcher: okFetch,
      resolveHost: publicResolver,
    });

    expect(result.checks.tracking.summary.detectedProviders).toBe(1);
    expect(result.summary.scripts).toBe(1);
  });

  it("aggregates URL Checker", async () => {
    const result = await runCampaignPreflight(goodHtml, ["https://example.com"], {
      fetcher: okFetch,
      resolveHost: publicResolver,
    });

    expect(result.checks.urls.summary).toMatchObject({
      total: 1,
      ok: 1,
      failed: 0,
    });
    expect(result.summary.urls).toBe(1);
  });

  it("calculates low risk score", async () => {
    const result = await runCampaignPreflight(goodHtml, ["https://example.com"], {
      fetcher: okFetch,
      resolveHost: publicResolver,
    });

    expect(result.score).toBe(100);
    expect(result.riskLevel).toBe("low");
  });

  it("penalizes form warnings", async () => {
    const result = await runCampaignPreflight(
      '<form><input required></form><script>GTM-ABC123</script>',
      [],
      { fetcher: okFetch, resolveHost: publicResolver },
    );

    expect(result.summary.formWarnings).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it("penalizes missing tracking", async () => {
    const result = await runCampaignPreflight(
      '<form action="/lead" method="post"><button></button></form>',
      [],
      { fetcher: okFetch, resolveHost: publicResolver },
    );

    expect(result.warnings).toContainEqual({
      area: "general",
      code: "no_tracking",
      message: "No supported tracking providers were detected.",
    });
    expect(result.score).toBe(92);
  });

  it("calculates high risk", async () => {
    const result = await runCampaignPreflight("<form><input required></form>", [
      "http://localhost",
      "ftp://example.com",
    ]);

    expect(result.riskLevel).toBe("high");
  });

  it("keeps SSRF errors from URL Checker", async () => {
    const result = await runCampaignPreflight(goodHtml, ["http://localhost"], {
      fetcher: okFetch,
      resolveHost: publicResolver,
    });

    expect(result.checks.urls.results[0].error).toBe(
      "Blocked internal or private URL.",
    );
    expect(result.warnings).toContainEqual({
      area: "urls",
      code: "Blocked internal or private URL.",
      message: "http://localhost: Blocked internal or private URL.",
    });
  });
});
