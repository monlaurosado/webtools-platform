export type PayloadValueType =
  | "null"
  | "boolean"
  | "number"
  | "string"
  | "array"
  | "object";

export type PayloadWarningCode = "mixed_array_types" | "empty_array";

export interface PayloadField {
  path: string;
  type: string;
  example: string | null;
}

export interface PayloadWarning {
  code: PayloadWarningCode;
  message: string;
  path: string;
}

export interface PayloadSummary {
  totalFields: number;
  objects: number;
  arrays: number;
  scalars: number;
}

export interface AnalyzePayloadResponse {
  rootType: PayloadValueType;
  fields: PayloadField[];
  summary: PayloadSummary;
  warnings: PayloadWarning[];
}
