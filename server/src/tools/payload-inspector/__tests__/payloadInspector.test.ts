import { describe, expect, it } from "vitest";
import {
  ERROR_MESSAGES,
  MAX_JSON_BYTES,
  MAX_JSON_DEPTH,
  MAX_JSON_NODES,
  analyzePayload,
} from "../service";

describe("analyzePayload", () => {
  it("rejects non-string json", () => {
    expect(() => analyzePayload({})).toThrow(ERROR_MESSAGES.invalidJsonInput);
  });

  it("rejects JSON larger than 1 MB", () => {
    expect(() => analyzePayload(" ".repeat(MAX_JSON_BYTES + 1))).toThrow(
      ERROR_MESSAGES.jsonTooLarge,
    );
  });

  it("rejects malformed JSON", () => {
    expect(() => analyzePayload("{ bad")).toThrow(ERROR_MESSAGES.malformedJson);
  });

  it("accepts 128 container levels but rejects deeper structures before walking them", () => {
    const nested = (depth: number) => "[".repeat(depth) + "0" + "]".repeat(depth);
    expect(analyzePayload(nested(MAX_JSON_DEPTH)).summary.arrays).toBe(MAX_JSON_DEPTH);
    expect(() => analyzePayload(nested(MAX_JSON_DEPTH + 1))).toThrow(ERROR_MESSAGES.jsonTooDeep);
  });

  it("bounds total JSON nodes even for shallow inputs below the byte limit", () => {
    const withinLimit = JSON.stringify(Array(MAX_JSON_NODES - 1).fill(0));
    const overLimit = JSON.stringify(Array(MAX_JSON_NODES).fill(0));
    expect(Buffer.byteLength(overLimit)).toBeLessThan(MAX_JSON_BYTES);
    expect(analyzePayload(withinLimit).summary.scalars).toBe(MAX_JSON_NODES - 1);
    expect(() => analyzePayload(overLimit)).toThrow(ERROR_MESSAGES.jsonTooComplex);
  });

  it("detects object root type", () => {
    const result = analyzePayload('{"event":"lead.created"}');

    expect(result.rootType).toBe("object");
  });

  it("extracts nested paths", () => {
    const result = analyzePayload(
      '{"event":"lead.created","lead":{"email":"test@example.com","score":10}}',
    );

    expect(result.fields).toEqual([
      { path: "event", type: "string", example: "lead.created" },
      { path: "lead.email", type: "string", example: "test@example.com" },
      { path: "lead.score", type: "number", example: "10" },
    ]);
  });

  it("extracts arrays of objects with [] paths", () => {
    const result = analyzePayload(
      '{"items":[{"id":1,"name":"A"},{"id":2,"name":"B"}]}',
    );

    expect(result.fields).toEqual([
      {
        path: "items",
        type: "array",
        example: '[{"id":1,"name":"A"},{"id":2,"name":"B"}]',
      },
      { path: "items[].id", type: "number", example: "1" },
      { path: "items[].name", type: "string", example: "A" },
    ]);
  });

  it("detects union types for the same path", () => {
    const result = analyzePayload('{"items":[{"id":1},{"id":"2"}]}');

    expect(result.fields).toContainEqual({
      path: "items[].id",
      type: "number|string",
      example: "1",
    });
  });

  it("detects empty array warnings", () => {
    const result = analyzePayload('{"items":[]}');

    expect(result.warnings).toEqual([
      {
        code: "empty_array",
        message: "Array does not contain items.",
        path: "items",
      },
    ]);
  });

  it("detects mixed array type warnings", () => {
    const result = analyzePayload('{"items":[1,"two"]}');

    expect(result.warnings).toEqual([
      {
        code: "mixed_array_types",
        message: "Array contains multiple item types.",
        path: "items",
      },
    ]);
  });

  it("calculates summary", () => {
    const result = analyzePayload(
      '{"lead":{"email":"test@example.com"},"items":[{"id":1},{"id":2}],"empty":[]}',
    );

    expect(result.summary).toEqual({
      totalFields: 4,
      objects: 3,
      arrays: 2,
      scalars: 3,
    });
  });
});
