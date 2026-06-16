import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, MAX_CSV_BYTES, compareCsvs } from "../service";

describe("compareCsvs", () => {
  it("rejects non-string CSV input", () => {
    expect(() => compareCsvs(123, "id\n1", "id")).toThrow(
      ERROR_MESSAGES.invalidCsv,
    );
  });

  it("rejects CSV larger than 1 MB", () => {
    expect(() => compareCsvs("x".repeat(MAX_CSV_BYTES + 1), "id\n1", "id")).toThrow(
      ERROR_MESSAGES.csvTooLarge,
    );
  });

  it("rejects missing key column", () => {
    expect(() => compareCsvs("id\n1", "id\n1", "email")).toThrow(
      ERROR_MESSAGES.invalidKeyColumn,
    );
  });

  it("detects rows only in A", () => {
    const result = compareCsvs("id,name\n1,Alice\n2,Bob", "id,name\n1,Alice", "id");

    expect(result.onlyInA).toEqual([
      {
        rowNumber: 3,
        key: "2",
        values: { id: "2", name: "Bob" },
      },
    ]);
  });

  it("detects rows only in B", () => {
    const result = compareCsvs("id,name\n1,Alice", "id,name\n1,Alice\n2,Bob", "id");

    expect(result.onlyInB).toEqual([
      {
        rowNumber: 3,
        key: "2",
        values: { id: "2", name: "Bob" },
      },
    ]);
  });

  it("detects modified rows", () => {
    const result = compareCsvs(
      "id,email\n1,a@example.com",
      "id,email\n1,new@example.com",
      "id",
    );

    expect(result.modifiedRows).toEqual([
      {
        key: "1",
        rowNumberA: 2,
        rowNumberB: 2,
        differences: [
          {
            column: "email",
            valueA: "a@example.com",
            valueB: "new@example.com",
          },
        ],
      },
    ]);
  });

  it("detects columns that only exist in one CSV as differences", () => {
    const result = compareCsvs(
      "id,email,source\n1,a@example.com,ads",
      "id,email,status\n1,a@example.com,new",
      "id",
    );

    expect(result.modifiedRows[0].differences).toEqual([
      { column: "source", valueA: "ads", valueB: null },
      { column: "status", valueA: null, valueB: "new" },
    ]);
  });

  it("detects duplicates in A", () => {
    const result = compareCsvs("id,name\n1,Alice\n1,Alice 2", "id,name\n1,Alice", "id");

    expect(result.duplicateKeys).toEqual([
      {
        side: "A",
        rowNumber: 3,
        duplicateOfRowNumber: 2,
        key: "1",
        values: { id: "1", name: "Alice 2" },
      },
    ]);
  });

  it("detects duplicates in B", () => {
    const result = compareCsvs("id,name\n1,Alice", "id,name\n1,Alice\n1,Alice 2", "id");

    expect(result.duplicateKeys).toEqual([
      {
        side: "B",
        rowNumber: 3,
        duplicateOfRowNumber: 2,
        key: "1",
        values: { id: "1", name: "Alice 2" },
      },
    ]);
  });

  it("supports quoted values with commas", () => {
    const result = compareCsvs(
      'id,company\n1,"ACME, Inc."',
      'id,company\n1,"ACME, LLC"',
      "id",
    );

    expect(result.modifiedRows[0].differences).toEqual([
      { column: "company", valueA: "ACME, Inc.", valueB: "ACME, LLC" },
    ]);
  });

  it("supports escaped quotes", () => {
    const result = compareCsvs(
      'id,note\n1,"Said ""hello"""',
      'id,note\n1,"Said ""bye"""',
      "id",
    );

    expect(result.modifiedRows[0].differences).toEqual([
      { column: "note", valueA: 'Said "hello"', valueB: 'Said "bye"' },
    ]);
  });

  it("calculates summary", () => {
    const result = compareCsvs(
      "id,email\n1,a@example.com\n2,b@example.com\n2,b2@example.com",
      "id,email\n1,new@example.com\n3,c@example.com",
      "id",
    );

    expect(result.summary).toEqual({
      rowsA: 3,
      rowsB: 2,
      onlyInA: 1,
      onlyInB: 1,
      modified: 1,
      duplicateKeys: 1,
    });
  });
});
