export interface PayloadField {
  path: string
  type: string
  example: string | null
}

export interface PayloadWarning {
  code: 'mixed_array_types' | 'empty_array'
  message: string
  path: string
}

export interface PayloadSummary {
  totalFields: number
  objects: number
  arrays: number
  scalars: number
}

export interface AnalyzePayloadResponse {
  rootType: string
  fields: PayloadField[]
  summary: PayloadSummary
  warnings: PayloadWarning[]
}
