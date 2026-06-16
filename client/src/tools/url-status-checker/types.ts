export interface UrlRedirectHop {
  from: string
  to: string
  statusCode: number
}

export interface UrlInspectionResult {
  index: number
  inputUrl: string
  finalUrl: string | null
  statusCode: number | null
  ok: boolean
  redirects: UrlRedirectHop[]
  error: string | null
}

export interface UrlInspectionSummary {
  total: number
  ok: number
  redirected: number
  failed: number
  blocked: number
}

export interface InspectUrlsResponse {
  results: UrlInspectionResult[]
  summary: UrlInspectionSummary
}
