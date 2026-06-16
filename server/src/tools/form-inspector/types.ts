export type FormFieldTag = "input" | "select" | "textarea" | "button";

export type FormWarningCode =
  | "missing_action"
  | "empty_action"
  | "hash_action"
  | "missing_method"
  | "invalid_method"
  | "input_missing_name"
  | "hidden_missing_name"
  | "required_missing_name"
  | "missing_submit_button"
  | "duplicate_action_method";

export interface SelectOption {
  value: string | null;
  label: string;
  selected: boolean;
  disabled: boolean;
}

export interface FormField {
  tag: FormFieldTag;
  type: string | null;
  name: string | null;
  id: string | null;
  value: string | null;
  placeholder: string | null;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  label: string | null;
  options: SelectOption[];
}

export interface FormSummary {
  totalFields: number;
  inputs: number;
  selects: number;
  textareas: number;
  buttons: number;
  hiddenFields: number;
  requiredFields: number;
}

export interface FormWarning {
  code: FormWarningCode;
  message: string;
  fieldIndex?: number;
}

export interface InspectedForm {
  index: number;
  action: string | null;
  method: string | null;
  fields: FormField[];
  summary: FormSummary;
  warnings: FormWarning[];
}

export interface AnalyzeFormsResponse {
  forms: InspectedForm[];
}
