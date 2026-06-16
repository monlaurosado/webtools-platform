import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import {
  AnalyzeFormsResponse,
  FormField,
  FormFieldTag,
  FormSummary,
  FormWarning,
  InspectedForm,
  SelectOption,
} from "./types";

export const MAX_HTML_BYTES = 1024 * 1024;

export const ERROR_MESSAGES = {
  invalidHtml: "Invalid html. Expected string.",
  htmlTooLarge: "HTML input exceeds the 1 MB limit.",
} as const;

const FIELD_SELECTOR = "input, select, textarea, button";
const VALID_METHODS = new Set(["get", "post"]);

const ensureHtml = (html: unknown): string => {
  if (typeof html !== "string") {
    throw new Error(ERROR_MESSAGES.invalidHtml);
  }

  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    throw new Error(ERROR_MESSAGES.htmlTooLarge);
  }

  return html;
};

const attrOrNull = (
  $: cheerio.CheerioAPI,
  element: Element,
  attribute: string,
): string | null => {
  const value = $(element).attr(attribute);
  return value == null ? null : value;
};

const rawAttrOrNull = (
  element: Element,
  attribute: string,
): string | null => {
  return element.attribs?.[attribute] ?? null;
};

const normalizeText = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

const getTagName = (element: Element): FormFieldTag => {
  return element.tagName.toLowerCase() as FormFieldTag;
};

const getFieldType = (
  $: cheerio.CheerioAPI,
  element: Element,
  tag: FormFieldTag,
): string | null => {
  const type = $(element).attr("type");

  if (type != null && type.trim().length > 0) {
    return type.toLowerCase();
  }

  if (tag === "input") {
    return "text";
  }

  if (tag === "button") {
    return "submit";
  }

  return null;
};

const getFieldValue = (
  $: cheerio.CheerioAPI,
  element: Element,
  tag: FormFieldTag,
): string | null => {
  const value = $(element).attr("value");
  if (value != null) {
    return value;
  }

  if (tag === "textarea") {
    return $(element).text();
  }

  return null;
};

const getLabel = (
  $: cheerio.CheerioAPI,
  form: Element,
  element: Element,
): string | null => {
  const id = $(element).attr("id");

  if (id != null && id.length > 0) {
    const explicitLabel = $(form).find("label").filter((_, label) => {
      return $(label).attr("for") === id;
    }).first();

    if (explicitLabel.length > 0) {
      const labelText = normalizeText(explicitLabel.text());
      return labelText.length > 0 ? labelText : null;
    }
  }

  const wrappingLabel = $(element).parents("label").first();
  if (wrappingLabel.length > 0) {
    const labelText = normalizeText(wrappingLabel.text());
    return labelText.length > 0 ? labelText : null;
  }

  return null;
};

const getSelectOptions = (
  $: cheerio.CheerioAPI,
  element: Element,
): SelectOption[] => {
  return $(element)
    .find("option")
    .toArray()
    .map((option) => ({
      value: rawAttrOrNull(option, "value"),
      label: normalizeText($(option).text()),
      selected: $(option).is("[selected]"),
      disabled: $(option).is("[disabled]"),
    }));
};

const createEmptySummary = (): FormSummary => ({
  totalFields: 0,
  inputs: 0,
  selects: 0,
  textareas: 0,
  buttons: 0,
  hiddenFields: 0,
  requiredFields: 0,
});

const createField = (
  $: cheerio.CheerioAPI,
  form: Element,
  element: Element,
): FormField => {
  const tag = getTagName(element);
  const type = getFieldType($, element, tag);

  return {
    tag,
    type,
    name: attrOrNull($, element, "name"),
    id: attrOrNull($, element, "id"),
    value: getFieldValue($, element, tag),
    placeholder: attrOrNull($, element, "placeholder"),
    required: $(element).is("[required]"),
    disabled: $(element).is("[disabled]"),
    readonly: $(element).is("[readonly]"),
    label: getLabel($, form, element),
    options: tag === "select" ? getSelectOptions($, element) : [],
  };
};

const addFieldToSummary = (summary: FormSummary, field: FormField): void => {
  summary.totalFields += 1;

  if (field.tag === "input") {
    summary.inputs += 1;
  }
  if (field.tag === "select") {
    summary.selects += 1;
  }
  if (field.tag === "textarea") {
    summary.textareas += 1;
  }
  if (field.tag === "button") {
    summary.buttons += 1;
  }
  if (field.tag === "input" && field.type === "hidden") {
    summary.hiddenFields += 1;
  }
  if (field.required) {
    summary.requiredFields += 1;
  }
};

const hasSubmitButton = (fields: FormField[]): boolean => {
  return fields.some((field) => {
    if (field.tag === "button") {
      return field.type === "submit";
    }

    if (field.tag === "input") {
      return field.type === "submit" || field.type === "image";
    }

    return false;
  });
};

const createWarning = (
  code: FormWarning["code"],
  message: string,
  fieldIndex?: number,
): FormWarning => {
  if (fieldIndex == null) {
    return { code, message };
  }

  return { code, message, fieldIndex };
};

const getFormWarnings = (form: InspectedForm): FormWarning[] => {
  const warnings: FormWarning[] = [];

  if (form.action == null) {
    warnings.push(
      createWarning("missing_action", "Form does not define an action attribute."),
    );
  } else if (form.action.trim().length === 0) {
    warnings.push(createWarning("empty_action", "Form action is empty."));
  } else if (form.action.trim() === "#") {
    warnings.push(createWarning("hash_action", "Form action points to #."));
  }

  if (form.method == null || form.method.trim().length === 0) {
    warnings.push(
      createWarning("missing_method", "Form does not define a method attribute."),
    );
  } else if (!VALID_METHODS.has(form.method)) {
    warnings.push(
      createWarning("invalid_method", "Form method should be get or post."),
    );
  }

  form.fields.forEach((field, fieldIndex) => {
    const hasName = field.name != null && field.name.trim().length > 0;

    if (!hasName && field.tag !== "button") {
      warnings.push(
        createWarning(
          "input_missing_name",
          "Field does not define a name attribute.",
          fieldIndex,
        ),
      );
    }

    if (!hasName && field.tag === "input" && field.type === "hidden") {
      warnings.push(
        createWarning(
          "hidden_missing_name",
          "Hidden field does not define a name attribute.",
          fieldIndex,
        ),
      );
    }

    if (!hasName && field.required) {
      warnings.push(
        createWarning(
          "required_missing_name",
          "Required field does not define a name attribute.",
          fieldIndex,
        ),
      );
    }
  });

  if (!hasSubmitButton(form.fields)) {
    warnings.push(
      createWarning("missing_submit_button", "Form does not contain a submit button."),
    );
  }

  return warnings;
};

const getDuplicateKey = (form: InspectedForm): string => {
  return `${form.action ?? ""}\u0000${form.method ?? ""}`;
};

const addDuplicateWarnings = (forms: InspectedForm[]): void => {
  const formGroups = new Map<string, InspectedForm[]>();

  for (const form of forms) {
    const key = getDuplicateKey(form);
    formGroups.set(key, [...(formGroups.get(key) ?? []), form]);
  }

  for (const group of formGroups.values()) {
    if (group.length < 2) {
      continue;
    }

    for (const form of group) {
      form.warnings.push(
        createWarning(
          "duplicate_action_method",
          "Another form uses the same action and method.",
        ),
      );
    }
  }
};

export const analyzeForms = (htmlInput: unknown): AnalyzeFormsResponse => {
  const html = ensureHtml(htmlInput);
  const $ = cheerio.load(html, undefined, false);

  const forms: InspectedForm[] = $("form")
    .toArray()
    .map((form, index) => {
      const action = attrOrNull($, form, "action");
      const methodValue = attrOrNull($, form, "method");
      const method = methodValue == null ? null : methodValue.toLowerCase();
      const summary = createEmptySummary();
      const fields = $(form)
        .find(FIELD_SELECTOR)
        .toArray()
        .map((field) => {
          const inspectedField = createField($, form, field);
          addFieldToSummary(summary, inspectedField);
          return inspectedField;
        });

      const inspectedForm: InspectedForm = {
        index,
        action,
        method,
        fields,
        summary,
        warnings: [],
      };

      inspectedForm.warnings = getFormWarnings(inspectedForm);

      return inspectedForm;
    });

  addDuplicateWarnings(forms);

  return { forms };
};
