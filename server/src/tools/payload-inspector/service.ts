import {
  AnalyzePayloadResponse,
  PayloadField,
  PayloadValueType,
  PayloadWarning,
} from "./types";

export const MAX_JSON_BYTES = 1024 * 1024;

export const ERROR_MESSAGES = {
  invalidJsonInput: "Invalid json. Expected string.",
  jsonTooLarge: "JSON input exceeds the 1 MB limit.",
  malformedJson: "Malformed JSON input.",
} as const;

const TYPE_ORDER: PayloadValueType[] = [
  "null",
  "boolean",
  "number",
  "string",
  "array",
  "object",
];

const ensureJson = (json: unknown): string => {
  if (typeof json !== "string") {
    throw new Error(ERROR_MESSAGES.invalidJsonInput);
  }

  if (Buffer.byteLength(json, "utf8") > MAX_JSON_BYTES) {
    throw new Error(ERROR_MESSAGES.jsonTooLarge);
  }

  return json;
};

const getValueType = (value: unknown): PayloadValueType => {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  const valueType = typeof value;
  if (
    valueType === "boolean" ||
    valueType === "number" ||
    valueType === "string" ||
    valueType === "object"
  ) {
    return valueType;
  }

  return "string";
};

const formatExample = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
};

const createFieldRecord = () => ({
  types: new Set<PayloadValueType>(),
  example: null as string | null,
});

export const analyzePayload = (jsonInput: unknown): AnalyzePayloadResponse => {
  const json = ensureJson(jsonInput);
  let payload: unknown;

  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error(ERROR_MESSAGES.malformedJson);
  }

  const fields = new Map<string, ReturnType<typeof createFieldRecord>>();
  const warnings: PayloadWarning[] = [];
  let objects = 0;
  let arrays = 0;
  let scalars = 0;

  const addField = (path: string, value: unknown): void => {
    if (path.length === 0) {
      return;
    }

    const current = fields.get(path) ?? createFieldRecord();
    current.types.add(getValueType(value));

    if (current.example == null) {
      current.example = formatExample(value);
    }

    fields.set(path, current);
  };

  const walk = (value: unknown, path: string, isRoot: boolean): void => {
    const type = getValueType(value);

    if (type === "array") {
      arrays += 1;
      addField(path, value);

      const items = value as unknown[];
      if (items.length === 0) {
        warnings.push({
          code: "empty_array",
          message: "Array does not contain items.",
          path,
        });
        return;
      }

      const itemTypes = new Set(items.map(getValueType));
      if (itemTypes.size > 1) {
        warnings.push({
          code: "mixed_array_types",
          message: "Array contains multiple item types.",
          path,
        });
      }

      for (const item of items) {
        walk(item, `${path}[]`, false);
      }
      return;
    }

    if (type === "object") {
      if (!isRoot) {
        objects += 1;
      }

      const objectValue = value as Record<string, unknown>;
      for (const [key, childValue] of Object.entries(objectValue)) {
        const childPath = path.length === 0 ? key : `${path}.${key}`;
        walk(childValue, childPath, false);
      }
      return;
    }

    scalars += 1;
    addField(path, value);
  };

  walk(payload, "", true);

  const outputFields: PayloadField[] = [...fields.entries()].map(
    ([path, record]) => ({
      path,
      type: TYPE_ORDER.filter((type) => record.types.has(type)).join("|"),
      example: record.example,
    }),
  );

  return {
    rootType: getValueType(payload),
    fields: outputFields,
    summary: {
      totalFields: outputFields.length,
      objects,
      arrays,
      scalars,
    },
    warnings,
  };
};
