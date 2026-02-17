export const VALID_ATTRIBUTES = ["href", "src"] as const;

export type HtmlAttribute = (typeof VALID_ATTRIBUTES)[number];

export interface ExtractRequest {
  html: string;
  attribute: HtmlAttribute;
}

export interface ExtractResponse {
  values: string[];
}

export interface ReplaceRequest {
  html: string;
  attribute: HtmlAttribute;
  replacements: Record<string, string>;
}

export interface ReplaceResponse {
  html: string;
}
