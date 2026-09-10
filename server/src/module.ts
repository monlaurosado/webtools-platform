/** Public Node API for hosts. Routing, cookies and framework objects stay outside. */
import { ERROR_MESSAGES as campaignErrors, runCampaignPreflight } from "./tools/campaign-preflight/service";
import { ERROR_MESSAGES as csvErrors, compareCsvs } from "./tools/csv-compare/service";
import { ERROR_MESSAGES as formErrors, analyzeForms } from "./tools/form-inspector/service";
import { extractAttributeValues, replaceAttributeValues } from "./tools/html-refactor/service";
import { ERROR_MESSAGES as leadErrors, cleanLeadCsv } from "./tools/lead-csv-cleaner/service";
import { ERROR_MESSAGES as payloadErrors, analyzePayload } from "./tools/payload-inspector/service";
import { ERROR_MESSAGES as trackingErrors, analyzeTracking } from "./tools/tracking-inspector/service";
import { ERROR_MESSAGES as urlErrors, inspectUrls } from "./tools/url-status-checker/service";

export const WEBTOOLS_MAX_BODY_BYTES = 2 * 1024 * 1024;

type Body = Record<string, unknown>;
type Operation = {
  run: (body: Body) => unknown | Promise<unknown>;
  isValidationError: (message: string) => boolean;
};

const matches = (messages: Record<string, string>) => (message: string) =>
  Object.values(messages).includes(message);

const operations: Record<string, Operation> = {
  "html-refactor/extract": {
    run: ({ html, attribute }) => ({ values: extractAttributeValues(html, attribute) }),
    isValidationError: () => true,
  },
  "html-refactor/replace": {
    run: ({ html, attribute, replacements }) => ({ html: replaceAttributeValues(html, attribute, replacements) }),
    isValidationError: () => true,
  },
  "form-inspector/analyze": {
    run: ({ html }) => analyzeForms(html),
    isValidationError: matches(formErrors),
  },
  "lead-csv-cleaner/clean": {
    run: ({ csv, keyColumn }) => cleanLeadCsv(csv, keyColumn),
    isValidationError: matches(leadErrors),
  },
  "url-status-checker/inspect": {
    run: ({ urls }) => inspectUrls(urls),
    isValidationError: matches(urlErrors),
  },
  "payload-inspector/analyze": {
    run: ({ json }) => analyzePayload(json),
    isValidationError: matches(payloadErrors),
  },
  "csv-compare/compare": {
    run: ({ csvA, csvB, keyColumn }) => compareCsvs(csvA, csvB, keyColumn),
    isValidationError: matches(csvErrors),
  },
  "tracking-inspector/analyze": {
    run: ({ html }) => analyzeTracking(html),
    isValidationError: matches(trackingErrors),
  },
  "campaign-preflight/check": {
    run: ({ html, urls }) => runCampaignPreflight(html, urls),
    isValidationError: (message) => matches(campaignErrors)(message) ||
      message.startsWith("Invalid ") || message.includes("exceeds the 1 MB limit") ||
      message === urlErrors.tooManyUrls,
  },
};

export const WEBTOOLS_ENDPOINTS: readonly string[] = Object.freeze(Object.keys(operations));

export interface WebToolsResponse {
  status: number;
  body: unknown;
}

/** Hosts enforce POST and the byte limit before parsing JSON; service validation is shared. */
export async function dispatchWebToolsRequest(endpoint: string, body: unknown): Promise<WebToolsResponse> {
  const operation = Object.prototype.hasOwnProperty.call(operations, endpoint) ? operations[endpoint] : undefined;
  if (!operation) return { status: 404, body: { error: "Unknown WebTools endpoint." } };

  try {
    const input = body !== null && typeof body === "object" && !Array.isArray(body) ? body as Body : {};
    return { status: 200, body: await operation.run(input) };
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unexpected error.";
    if (message === urlErrors.busy) return { status: 503, body: { error: message } };
    const isValidationError = operation.isValidationError(message);
    return {
      status: isValidationError ? 400 : 500,
      body: { error: isValidationError ? message : "Unexpected error." },
    };
  }
}
