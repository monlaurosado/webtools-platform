import { BlockList, isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { RequestOptions } from "node:https";
import type { FetchLike } from "../tools/url-status-checker/types";

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(address, prefix, "ipv4");

// BlockList also applies IPv4 rules to IPv4-mapped IPv6 in either textual form.
for (const [address, prefix] of [
  ["::", 96], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["100::", 64],
  ["2001::", 32], ["2001:db8::", 32], ["2002::", 16],
  ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
] as const) blocked.addSubnet(address, prefix, "ipv6");

export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  return family === 0 || blocked.check(address, family === 4 ? "ipv4" : "ipv6");
}

/** Only verified addresses reach connect; preserve hostname for TLS SNI and HTTP Host. */
export const fetchPublicHeaders: FetchLike = (url, init) => new Promise((resolve, reject) => {
  const addresses = init.addresses;
  if (!addresses?.length || addresses.some(({ address }) => isBlockedAddress(address))) {
    reject(new Error("Blocked internal or private URL."));
    return;
  }

  const parsed = new URL(url);
  const request = parsed.protocol === "https:" ? httpsRequest : httpRequest;
  const options: RequestOptions & { autoSelectFamily: boolean } = {
    method: init.method,
    signal: init.signal,
    agent: false,
    maxHeaderSize: 16 * 1024,
    autoSelectFamily: true,
    lookup: (_hostname, options, callback) => {
      if (options.all) callback(null, addresses);
      else callback(null, addresses[0].address, addresses[0].family);
    },
    headers: { "User-Agent": "WebTools-URL-Checker/1.0", Accept: "*/*" },
  };
  const req = request(parsed, options, (response) => {
    const headers = response.headers;
    resolve({
      status: response.statusCode ?? 0,
      headers: {
        get(name) {
          const value = headers[name.toLowerCase()];
          return Array.isArray(value) ? value.join(", ") : value ?? null;
        },
      },
    });
    // The checker only needs status and headers; never download a response body.
    response.destroy();
    req.destroy();
  });
  req.on("error", reject);
  req.on("upgrade", (_response, socket) => {
    socket.destroy();
    reject(new Error("Request failed."));
  });
  req.end();
});
