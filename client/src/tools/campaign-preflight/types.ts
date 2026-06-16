export type CampaignRiskLevel = 'low' | 'medium' | 'high'

export interface CampaignPreflightSummary {
  forms: number
  formWarnings: number
  scripts: number
  trackingWarnings: number
  urls: number
  urlFailures: number
}

export interface CampaignPreflightWarning {
  area: 'forms' | 'tracking' | 'urls' | 'general'
  code: string
  message: string
}

export interface CampaignPreflightResponse {
  score: number
  riskLevel: CampaignRiskLevel
  summary: CampaignPreflightSummary
  checks: {
    forms: {
      forms: Array<{ index: number; action: string | null; method: string | null }>
    }
    tracking: {
      scripts: Array<{ provider: string | null; identifier: string | null; src: string | null }>
    }
    urls: {
      results: Array<{
        inputUrl: string
        finalUrl: string | null
        statusCode: number | null
        ok: boolean
        error: string | null
      }>
    }
  }
  warnings: CampaignPreflightWarning[]
}
