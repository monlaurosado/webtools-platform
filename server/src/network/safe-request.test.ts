import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));
vi.mock("node:http", () => ({ request: requestMock }));
vi.mock("node:https", () => ({ request: requestMock }));
import { fetchPublicHeaders, isBlockedAddress } from "./safe-request";

describe("public-address policy", () => {
  it.each([
    "0.0.0.0", "10.0.0.1", "100.64.0.1", "127.0.0.1", "169.254.169.254", "172.16.0.1",
    "192.168.0.1", "224.0.0.1", "255.255.255.255", "::", "::1", "::ffff:127.0.0.1",
    "::ffff:7f00:1", "0:0:0:0:0:ffff:c0a8:1", "fc00::1", "fd00::1", "fe80::1", "ff02::1",
    "64:ff9b::a00:1", "2002:7f00:1::", "not-an-ip",
  ])("blocks %s", (address) => expect(isBlockedAddress(address)).toBe(true));

  it.each(["1.1.1.1", "93.184.216.34", "2606:4700:4700::1111", "::ffff:1.1.1.1"])("allows %s", (address) => {
    expect(isBlockedAddress(address)).toBe(false);
  });
});

describe("pinned Node transport", () => {
  beforeEach(() => requestMock.mockReset());

  it("connects using only verified addresses, preserves hostname, and releases body immediately", async () => {
    const response = { statusCode: 302, headers: { location: "/next" }, destroy: vi.fn() };
    const req = Object.assign(new EventEmitter(), { destroy: vi.fn(), end: vi.fn() });
    requestMock.mockImplementation((_url, _options, callback) => {
      req.end.mockImplementation(() => callback(response));
      return req;
    });
    const addresses = [{ address: "93.184.216.34", family: 4 }];
    const result = await fetchPublicHeaders("https://public.example/page", { method: "GET", redirect: "manual", addresses });
    const [url, options] = requestMock.mock.calls[0];
    expect(url.hostname).toBe("public.example");
    expect(options).toMatchObject({ agent: false, maxHeaderSize: 16384, autoSelectFamily: true });
    const callback = vi.fn();
    options.lookup("public.example", { all: true }, callback);
    expect(callback).toHaveBeenCalledWith(null, addresses);
    options.lookup("public.example", { all: false }, callback);
    expect(callback).toHaveBeenLastCalledWith(null, "93.184.216.34", 4);
    expect(result.status).toBe(302);
    expect(result.headers.get("location")).toBe("/next");
    expect(response.destroy).toHaveBeenCalledOnce();
    expect(req.destroy).toHaveBeenCalledOnce();
  });

  it("refuses a missing or private pin before opening a socket", async () => {
    for (const addresses of [undefined, [{ address: "127.0.0.1", family: 4 }]]) {
      await expect(fetchPublicHeaders("https://public.example", { method: "GET", redirect: "manual", addresses })).rejects.toThrow("Blocked");
    }
    expect(requestMock).not.toHaveBeenCalled();
  });
});
