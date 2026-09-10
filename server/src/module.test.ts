import { describe, expect, it, vi } from "vitest";
import { dispatchWebToolsRequest, WEBTOOLS_ENDPOINTS } from "./module";

const goodHtml = '<form action="/lead" method="post"><input name="email"><button>Send</button></form>' +
  '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>';

describe("framework-neutral WebTools API", () => {
  const fixtures = [
    ["html-refactor/extract", { html: '<a href="/a">A</a><a href="/a">Again</a>', attribute: "href" }, { values: ["/a"] }],
    ["html-refactor/replace", { html: '<a href="/a">A</a>', attribute: "href", replacements: { "/a": "/b" } }, { html: '<a href="/b">A</a>' }],
    ["form-inspector/analyze", { html: goodHtml }, { forms: [{ action: "/lead", method: "post" }] }],
    ["lead-csv-cleaner/clean", { csv: "email,name\nA@example.com,First\na@example.com,Second", keyColumn: "email" }, { summary: { totalRows: 2, cleanRows: 1, duplicateRows: 1 }, cleanCsv: "email,name\na@example.com,First" }],
    ["url-status-checker/inspect", { urls: ["http://127.0.0.1"] }, { summary: { total: 1, blocked: 1 } }],
    ["payload-inspector/analyze", { json: '{"email":"a@example.com","tags":[1,2]}' }, { rootType: "object", summary: { arrays: 1 } }],
    ["csv-compare/compare", { csvA: "id,name\n1,Before\n2,Old", csvB: "id,name\n1,After\n3,New", keyColumn: "id" }, { summary: { rowsA: 2, rowsB: 2, onlyInA: 1, onlyInB: 1, modified: 1 } }],
    ["tracking-inspector/analyze", { html: goodHtml }, { summary: { detectedProviders: 1 } }],
    ["campaign-preflight/check", { html: goodHtml, urls: [] }, { score: 100, riskLevel: "low" }],
  ] as const;

  it.each(fixtures)("preserves real output for %s", async (endpoint, input, expected) => {
    const result = await dispatchWebToolsRequest(endpoint, input);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject(expected);
    expect(JSON.parse(JSON.stringify(result.body))).toEqual(result.body);
  });

  it.each(WEBTOOLS_ENDPOINTS)("preserves validation status for %s", async (endpoint) => {
    const result = await dispatchWebToolsRequest(endpoint, {});
    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: expect.any(String) });
  });

  it.each([null, 12, "hello", []])("rejects missing fields in malformed body %j", async (body) => {
    expect(await dispatchWebToolsRequest("html-refactor/extract", body)).toEqual({
      status: 400, body: { error: "Invalid html. Expected string." },
    });
  });

  it.each(["unknown", "constructor", "__proto__", "toString"])("returns 404 for %s", async (endpoint) => {
    expect((await dispatchWebToolsRequest(endpoint, {})).status).toBe(404);
  });

  it("keeps preflight's upstream size errors as 400", async () => {
    expect(await dispatchWebToolsRequest("campaign-preflight/check", { html: "x".repeat(1024 * 1024 + 1) })).toEqual({
      status: 400, body: { error: "HTML input exceeds the 1 MB limit." },
    });
  });

  it("rejects deeply nested JSON as a bounded validation error", async () => {
    const json = "[".repeat(6000) + "0" + "]".repeat(6000);
    expect(await dispatchWebToolsRequest("payload-inspector/analyze", { json })).toEqual({
      status: 400, body: { error: "JSON nesting exceeds the maximum depth of 128." },
    });
  });

  it("does not expose an unexpected internal failure message", async () => {
    const stringify = vi.spyOn(JSON, "stringify").mockImplementation(() => { throw new Error("Internal detail /srv/private/service"); });
    let result;
    try { result = await dispatchWebToolsRequest("payload-inspector/analyze", { json: '{"items":[1]}' }); }
    finally { stringify.mockRestore(); }
    expect(result).toEqual({ status: 500, body: { error: "Unexpected error." } });
  });
});
