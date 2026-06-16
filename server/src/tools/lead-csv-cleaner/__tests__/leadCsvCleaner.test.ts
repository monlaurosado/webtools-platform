import { describe, expect, it } from "vitest";
import {
  ERROR_MESSAGES,
  MAX_CSV_BYTES,
  cleanLeadCsv,
} from "../service";

describe("cleanLeadCsv", () => {
  it("rejects non-string csv", () => {
    expect(() => cleanLeadCsv(123, "email")).toThrow(ERROR_MESSAGES.invalidCsv);
  });

  it("rejects CSV larger than 1 MB", () => {
    expect(() => cleanLeadCsv("x".repeat(MAX_CSV_BYTES + 1), "email")).toThrow(
      ERROR_MESSAGES.csvTooLarge,
    );
  });

  it("rejects missing key column", () => {
    expect(() => cleanLeadCsv("email,name\na@example.com,Alice", "id")).toThrow(
      ERROR_MESSAGES.invalidKeyColumn,
    );
  });

  it("rejects CSV without header", () => {
    expect(() => cleanLeadCsv("", "email")).toThrow(ERROR_MESSAGES.missingHeader);
  });

  it("parses basic CSV", () => {
    const result = cleanLeadCsv("email,name\na@example.com,Alice", "email");

    expect(result.headers).toEqual(["email", "name"]);
    expect(result.cleanRows).toEqual([
      {
        rowNumber: 2,
        values: {
          email: "a@example.com",
          name: "Alice",
        },
      },
    ]);
    expect(result.summary).toEqual({
      totalRows: 1,
      cleanRows: 1,
      duplicateRows: 0,
      emptyKeyRows: 0,
    });
  });

  it("supports quoted values with commas", () => {
    const result = cleanLeadCsv(
      'email,name,company\na@example.com,"Alice Smith","ACME, Inc."',
      "email",
    );

    expect(result.cleanRows[0].values.company).toBe("ACME, Inc.");
  });

  it("supports escaped quotes", () => {
    const result = cleanLeadCsv(
      'email,note\na@example.com,"Said ""hello"""',
      "email",
    );

    expect(result.cleanRows[0].values.note).toBe('Said "hello"');
  });

  it("trims whitespace", () => {
    const result = cleanLeadCsv(
      " email , name \n a@example.com , Alice ",
      "email",
    );

    expect(result.headers).toEqual(["email", "name"]);
    expect(result.cleanRows[0].values).toEqual({
      email: "a@example.com",
      name: "Alice",
    });
  });

  it("normalizes email columns to lowercase", () => {
    const result = cleanLeadCsv(
      "Email,Secondary Email,name\nTEST@Example.com,ALT@Example.com,Alice",
      "Email",
    );

    expect(result.cleanRows[0].values.Email).toBe("test@example.com");
    expect(result.cleanRows[0].values["Secondary Email"]).toBe("alt@example.com");
  });

  it("keeps first occurrence as clean", () => {
    const result = cleanLeadCsv(
      "email,name\nsame@example.com,First\nsame@example.com,Second",
      "email",
    );

    expect(result.cleanRows).toHaveLength(1);
    expect(result.cleanRows[0].rowNumber).toBe(2);
    expect(result.cleanRows[0].values.name).toBe("First");
  });

  it("separates duplicates", () => {
    const result = cleanLeadCsv(
      "email,name\nsame@example.com,First\nsame@example.com,Second",
      "email",
    );

    expect(result.duplicateRows).toEqual([
      {
        rowNumber: 3,
        duplicateOfRowNumber: 2,
        key: "same@example.com",
        values: {
          email: "same@example.com",
          name: "Second",
        },
      },
    ]);
    expect(result.summary.duplicateRows).toBe(1);
  });

  it("keeps rows with empty key and generates warning", () => {
    const result = cleanLeadCsv("email,name\n,Alice", "email");

    expect(result.cleanRows).toHaveLength(1);
    expect(result.summary.emptyKeyRows).toBe(1);
    expect(result.warnings).toContainEqual({
      code: "empty_key",
      message: "Row has an empty key column value.",
      rowNumber: 2,
    });
  });

  it("warns when row column count differs from header", () => {
    const result = cleanLeadCsv("email,name\na@example.com", "email");

    expect(result.warnings).toContainEqual({
      code: "column_count_mismatch",
      message: "Row has a different number of columns than the header.",
      rowNumber: 2,
    });
  });

  it("generates cleanCsv and duplicateCsv", () => {
    const result = cleanLeadCsv(
      'email,name,note\nsame@example.com,Alice,"hello, world"\nsame@example.com,Bob,"quote ""test"""',
      "email",
    );

    expect(result.cleanCsv).toBe('email,name,note\nsame@example.com,Alice,"hello, world"');
    expect(result.duplicateCsv).toBe(
      'email,name,note\nsame@example.com,Bob,"quote ""test"""',
    );
  });
});
