import { describe, expect, it } from "vitest";
import { FetchLike, ResolveHost } from "../types";
import { ERROR_MESSAGES, inspectUrls } from "../service";

const publicResolver: ResolveHost = async () => [
  { address: "93.184.216.34", family: 4 },
];

const privateResolver: ResolveHost = async () => [
  { address: "10.0.0.5", family: 4 },
];

const response = (
  status: number,
  headers: Record<string, string> = {},
): Awaited<ReturnType<FetchLike>> => ({
  status,
  headers: {
    get(name: string) {
      return headers[name.toLowerCase()] ?? null;
    },
  },
});

describe("inspectUrls", () => {
  it("rejects non-array urls", async () => {
    await expect(inspectUrls("https://example.com")).rejects.toThrow(
      ERROR_MESSAGES.invalidUrls,
    );
  });

  it("rejects more than 50 URLs", async () => {
    await expect(
      inspectUrls(Array.from({ length: 51 }, () => "https://example.com")),
    ).rejects.toThrow(ERROR_MESSAGES.tooManyUrls);
  });

  it("returns one result per URL", async () => {
    const fetcher: FetchLike = async () => response(200);
    const result = await inspectUrls(
      ["https://a.example", "https://b.example"],
      { fetcher, resolveHost: publicResolver },
    );

    expect(result.results).toHaveLength(2);
  });

  it("blocks ftp protocol", async () => {
    const result = await inspectUrls(["ftp://example.com"], {
      fetcher: async () => response(200),
      resolveHost: publicResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.invalidProtocol);
  });

  it("blocks localhost", async () => {
    const result = await inspectUrls(["http://localhost:3001"], {
      fetcher: async () => response(200),
      resolveHost: publicResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
  });

  it("blocks private IPv4", async () => {
    const result = await inspectUrls(["http://192.168.1.20"], {
      fetcher: async () => response(200),
      resolveHost: publicResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
  });

  it("blocks hostnames that resolve to private IPs", async () => {
    const result = await inspectUrls(["https://internal.example"], {
      fetcher: async () => response(200),
      resolveHost: privateResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
  });

  it("detects 200 status without redirect", async () => {
    const result = await inspectUrls(["https://example.com"], {
      fetcher: async () => response(200),
      resolveHost: publicResolver,
    });

    expect(result.results[0]).toMatchObject({
      finalUrl: "https://example.com/",
      statusCode: 200,
      ok: true,
      redirects: [],
      error: null,
    });
  });

  it("uses GET so redirects that do not happen on HEAD are detected", async () => {
    const methods: string[] = [];
    const fetcher: FetchLike = async (url, init) => {
      methods.push(init.method);
      if (url === "https://example.com/final") {
        return response(200);
      }
      return response(301, { location: "https://example.com/final" });
    };

    const result = await inspectUrls(["https://example.com/old"], {
      fetcher,
      resolveHost: publicResolver,
    });

    expect(methods[0]).toBe("GET");
    expect(result.results[0].redirects[0]).toMatchObject({
      from: "https://example.com/old",
      to: "https://example.com/final",
      statusCode: 301,
    });
    expect(result.results[0].finalUrl).toBe("https://example.com/final");
  });

  it("follows absolute redirects", async () => {
    const fetcher: FetchLike = async (url) => {
      if (url === "https://example.com/old") {
        return response(301, { location: "https://example.com/new" });
      }
      return response(200);
    };

    const result = await inspectUrls(["https://example.com/old"], {
      fetcher,
      resolveHost: publicResolver,
    });

    expect(result.results[0].finalUrl).toBe("https://example.com/new");
    expect(result.results[0].redirects).toEqual([
      {
        from: "https://example.com/old",
        to: "https://example.com/new",
        statusCode: 301,
      },
    ]);
  });

  it("follows relative redirects", async () => {
    const fetcher: FetchLike = async (url) => {
      if (url === "https://example.com/old") {
        return response(302, { location: "/new" });
      }
      return response(200);
    };

    const result = await inspectUrls(["https://example.com/old"], {
      fetcher,
      resolveHost: publicResolver,
    });

    expect(result.results[0].finalUrl).toBe("https://example.com/new");
  });

  it("blocks redirects to internal URLs", async () => {
    const fetcher: FetchLike = async () =>
      response(302, { location: "http://localhost/admin" });

    const result = await inspectUrls(["https://example.com/old"], {
      fetcher,
      resolveHost: publicResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
    expect(result.results[0].redirects[0].to).toBe("http://localhost/admin");
  });

  it("detects too many redirects", async () => {
    const fetcher: FetchLike = async (url) => {
      const current = Number(new URL(url).searchParams.get("n") ?? "0");
      return response(302, {
        location: `https://example.com/loop?n=${current + 1}`,
      });
    };

    const result = await inspectUrls(["https://example.com/loop?n=0"], {
      fetcher,
      resolveHost: publicResolver,
    });

    expect(result.results[0].error).toBe(ERROR_MESSAGES.tooManyRedirects);
    expect(result.results[0].redirects).toHaveLength(5);
  });

  it("preserves order", async () => {
    const result = await inspectUrls(
      ["https://first.example", "ftp://blocked.example", "https://third.example"],
      { fetcher: async () => response(200), resolveHost: publicResolver },
    );

    expect(result.results.map((item) => item.inputUrl)).toEqual([
      "https://first.example",
      "ftp://blocked.example",
      "https://third.example",
    ]);
    expect(result.results.map((item) => item.index)).toEqual([0, 1, 2]);
  });

  it("calculates summary", async () => {
    const fetcher: FetchLike = async (url) => {
      if (url === "https://example.com/old") {
        return response(301, { location: "https://example.com/new" });
      }
      if (url === "https://example.com/not-found") {
        return response(404);
      }
      return response(200);
    };

    const result = await inspectUrls(
      [
        "https://example.com/ok",
        "https://example.com/old",
        "https://example.com/not-found",
        "http://localhost",
      ],
      { fetcher, resolveHost: publicResolver },
    );

    expect(result.summary).toEqual({
      total: 4,
      ok: 2,
      redirected: 1,
      failed: 2,
      blocked: 1,
    });
  });
});
