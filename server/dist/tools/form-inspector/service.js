"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeForms = exports.ERROR_MESSAGES = exports.MAX_HTML_BYTES = void 0;
const cheerio = __importStar(require("cheerio"));
exports.MAX_HTML_BYTES = 1024 * 1024;
exports.ERROR_MESSAGES = {
    invalidHtml: "Invalid html. Expected string.",
    htmlTooLarge: "HTML input exceeds the 1 MB limit.",
};
const FIELD_SELECTOR = "input, select, textarea, button";
const VALID_METHODS = new Set(["get", "post"]);
const ensureHtml = (html) => {
    if (typeof html !== "string") {
        throw new Error(exports.ERROR_MESSAGES.invalidHtml);
    }
    if (Buffer.byteLength(html, "utf8") > exports.MAX_HTML_BYTES) {
        throw new Error(exports.ERROR_MESSAGES.htmlTooLarge);
    }
    return html;
};
const attrOrNull = ($, element, attribute) => {
    const value = $(element).attr(attribute);
    return value == null ? null : value;
};
const rawAttrOrNull = (element, attribute) => {
    return element.attribs?.[attribute] ?? null;
};
const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
const getTagName = (element) => {
    return element.tagName.toLowerCase();
};
const getFieldType = ($, element, tag) => {
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
const getFieldValue = ($, element, tag) => {
    const value = $(element).attr("value");
    if (value != null) {
        return value;
    }
    if (tag === "textarea") {
        return $(element).text();
    }
    return null;
};
const getLabel = ($, form, element) => {
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
const getSelectOptions = ($, element) => {
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
const createEmptySummary = () => ({
    totalFields: 0,
    inputs: 0,
    selects: 0,
    textareas: 0,
    buttons: 0,
    hiddenFields: 0,
    requiredFields: 0,
});
const createField = ($, form, element) => {
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
const addFieldToSummary = (summary, field) => {
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
const hasSubmitButton = (fields) => {
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
const createWarning = (code, message, fieldIndex) => {
    if (fieldIndex == null) {
        return { code, message };
    }
    return { code, message, fieldIndex };
};
const getFormWarnings = (form) => {
    const warnings = [];
    if (form.action == null) {
        warnings.push(createWarning("missing_action", "Form does not define an action attribute."));
    }
    else if (form.action.trim().length === 0) {
        warnings.push(createWarning("empty_action", "Form action is empty."));
    }
    else if (form.action.trim() === "#") {
        warnings.push(createWarning("hash_action", "Form action points to #."));
    }
    if (form.method == null || form.method.trim().length === 0) {
        warnings.push(createWarning("missing_method", "Form does not define a method attribute."));
    }
    else if (!VALID_METHODS.has(form.method)) {
        warnings.push(createWarning("invalid_method", "Form method should be get or post."));
    }
    form.fields.forEach((field, fieldIndex) => {
        const hasName = field.name != null && field.name.trim().length > 0;
        if (!hasName && field.tag !== "button") {
            warnings.push(createWarning("input_missing_name", "Field does not define a name attribute.", fieldIndex));
        }
        if (!hasName && field.tag === "input" && field.type === "hidden") {
            warnings.push(createWarning("hidden_missing_name", "Hidden field does not define a name attribute.", fieldIndex));
        }
        if (!hasName && field.required) {
            warnings.push(createWarning("required_missing_name", "Required field does not define a name attribute.", fieldIndex));
        }
    });
    if (!hasSubmitButton(form.fields)) {
        warnings.push(createWarning("missing_submit_button", "Form does not contain a submit button."));
    }
    return warnings;
};
const getDuplicateKey = (form) => {
    return `${form.action ?? ""}\u0000${form.method ?? ""}`;
};
const addDuplicateWarnings = (forms) => {
    const formGroups = new Map();
    for (const form of forms) {
        const key = getDuplicateKey(form);
        formGroups.set(key, [...(formGroups.get(key) ?? []), form]);
    }
    for (const group of formGroups.values()) {
        if (group.length < 2) {
            continue;
        }
        for (const form of group) {
            form.warnings.push(createWarning("duplicate_action_method", "Another form uses the same action and method."));
        }
    }
};
const analyzeForms = (htmlInput) => {
    const html = ensureHtml(htmlInput);
    const $ = cheerio.load(html, undefined, false);
    const forms = $("form")
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
        const inspectedForm = {
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
exports.analyzeForms = analyzeForms;
