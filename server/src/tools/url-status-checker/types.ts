export interface UrlRedirectHop {
  from: string;
  to: string;
  statusCode: number;
}

export interface UrlInspectionResult {
  index: number;
  inputUrl: string;
  finalUrl: string | null;
  statusCode: number | null;
  ok: boolean;
  redirects: UrlRedirectHop[];
  error: string | null;
}

export interface UrlInspectionSummary {
  total: number;
  ok: number;
  redirected: number;
  failed: number;
  blocked: number;
}

export interface InspectUrlsResponse {
  results: UrlInspectionResult[];
  summary: UrlInspectionSummary;
}

export interface FetchLikeResponse {
  status: number;
  url?: string;
  headers: {
    get(name: string): string | null;
  };
}

export type FetchLike = (
  url: string,
  init: {
    method: "HEAD" | "GET";
    redirect: "manual";
    signal?: AbortSignal;
    /** DNS results verified before connect; used by the production Node transport. */
    addresses?: Array<{ address: string; family: number }>;
  },
) => Promise<FetchLikeResponse>;

export type ResolveHost = (
  hostname: string,
) => Promise<Array<{ address: string; family: number }>>;
