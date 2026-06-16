export type ScriptLocation = 'head' | 'body' | 'unknown'

export interface TrackingScript {
  index: number
  src: string | null
  inline: boolean
  provider: string | null
  identifier: string | null
  location: ScriptLocation
}

export interface TrackingWarning {
  code: 'duplicate_provider_id' | 'duplicate_src'
  message: string
  scriptIndexes: number[]
}

export interface TrackingSummary {
  totalScripts: number
  externalScripts: number
  inlineScripts: number
  detectedProviders: number
  warnings: number
}

export interface AnalyzeTrackingResponse {
  scripts: TrackingScript[]
  summary: TrackingSummary
  warnings: TrackingWarning[]
}
