import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => vi.useRealTimers());

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

  it.each([
    "http://[::1]", "http://[::ffff:127.0.0.1]", "http://[::ffff:c0a8:1]",
    "http://[fc00::1]", "http://[fe80::1]", "http://169.254.169.254",
    "http://localhost.", "http://user:password@example.com",
  ])("blocks %s without issuing a request", async (url) => {
    const fetcher = vi.fn(async () => response(200));
    const result = await inspectUrls([url], { fetcher, resolveHost: publicResolver });
    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("passes the verified DNS pin to the transport, then revalidates redirects", async () => {
    const resolveHost = vi.fn<ResolveHost>()
      .mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }])
      .mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
    const fetcher = vi.fn<FetchLike>().mockResolvedValue(response(302, { location: "/next" }));
    const result = await inspectUrls(["https://rebind.example"], { fetcher, resolveHost });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][1].addresses).toEqual([{ address: "93.184.216.34", family: 4 }]);
    expect(result.results[0].error).toBe(ERROR_MESSAGES.blockedUrl);
  });

  it("keeps malformed redirects as a per-URL failure", async () => {
    const result = await inspectUrls(["https://example.com"], {
      resolveHost: publicResolver,
      fetcher: async () => response(302, { location: "http://[invalid" }),
    });
    expect(result.summary.failed).toBe(1);
    expect(result.results[0].redirects).toHaveLength(1);
  });

  it("bounds an unresponsive DNS lookup", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<FetchLike>();
    const pending = inspectUrls(["https://example.com"], {
      fetcher, resolveHost: () => new Promise(() => {}),
    });
    await vi.advanceTimersByTimeAsync(5000);
    expect((await pending).results[0].error).toBe(ERROR_MESSAGES.requestTimedOut);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("limits active batches and releases capacity after timed-out requests", async () => {
    vi.useFakeTimers();
    const options = { fetcher: () => new Promise<Awaited<ReturnType<FetchLike>>>(() => {}), resolveHost: publicResolver };
    const batches = Array.from({ length: 4 }, () => inspectUrls(["https://example.com"], options));
    await expect(inspectUrls(["https://example.com"], options)).rejects.toThrow(ERROR_MESSAGES.busy);
    await vi.advanceTimersByTimeAsync(10000);
    const results = await Promise.all(batches);
    expect(results.every((result) => result.results[0].error === ERROR_MESSAGES.requestTimedOut)).toBe(true);
    expect((await inspectUrls([], options)).summary.total).toBe(0);
  });

  it("runs only four URL workers and stops a 50-URL batch at 30 seconds", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<FetchLike>(() => new Promise(() => {}));
    const pending = inspectUrls(Array.from({ length: 50 }, () => "https://example.com"), { fetcher, resolveHost: publicResolver });
    await vi.advanceTimersByTimeAsync(1);
    expect(fetcher).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(29999);
    const result = await pending;
    expect(fetcher).toHaveBeenCalledTimes(12);
    expect(result.results).toHaveLength(50);
    expect(result.results.every((item) => item.error === ERROR_MESSAGES.requestTimedOut)).toBe(true);
    expect(result.results.map((item) => item.index)).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});
