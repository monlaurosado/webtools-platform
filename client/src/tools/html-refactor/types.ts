export type HtmlAttribute = 'href' | 'src'

export interface ExtractResponse {
  values: string[]
}

export interface ReplaceResponse {
  html: string
}

export interface ReplacementRowState {
  replacement: string
  ignored: boolean
}

export interface ReplacementEntry extends ReplacementRowState {
  original: string
}

export type CopyState = 'idle' | 'copied' | 'error'
