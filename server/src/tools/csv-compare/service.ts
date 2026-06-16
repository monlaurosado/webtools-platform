import {
  CsvCompareResponse,
  CsvCompareRow,
  CsvDifference,
  DuplicateCsvKey,
} from "./types";

export const MAX_CSV_BYTES = 1024 * 1024;

export const ERROR_MESSAGES = {
  invalidCsv: "Invalid csv. Expected string.",
  csvTooLarge: "CSV input exceeds the 1 MB limit.",
  missingHeader: "CSV must include a header row.",
  invalidKeyColumn: "Invalid keyColumn. Expected existing CSV header in both files.",
  malformedCsv: "Malformed CSV input.",
} as const;

const ensureCsv = (value: unknown): string => {
  if (typeof value !== "string") {
    throw new Error(ERROR_MESSAGES.invalidCsv);
  }

  if (Buffer.byteLength(value, "utf8") > MAX_CSV_BYTES) {
    throw new Error(ERROR_MESSAGES.csvTooLarge);
  }

  return value;
};

const ensureKeyColumn = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.invalidKeyColumn);
  }

  return value.trim();
};

const stripBom = (value: string): string =>
  value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;

const parseCsv = (csvInput: string): string[][] => {
  const csv = stripBom(csvInput);
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        value += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      value += char;
      continue;
    }

    if (char === '"') {
      if (value.length > 0) {
        throw new Error(ERROR_MESSAGES.malformedCsv);
      }
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    if (char === "\r") {
      if (nextChar === "\n") {
        continue;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (inQuotes) {
    throw new Error(ERROR_MESSAGES.malformedCsv);
  }

  row.push(value);
  rows.push(row);

  return rows.filter((currentRow, index) => {
    if (index === 0) {
      return true;
    }
    return currentRow.some((cell) => cell.trim().length > 0);
  });
};

const parseTable = (csv: string) => {
  const parsedRows = parseCsv(csv);

  if (parsedRows.length === 0 || parsedRows[0].every((cell) => cell.trim().length === 0)) {
    throw new Error(ERROR_MESSAGES.missingHeader);
  }

  const headers = parsedRows[0].map((header) => header.trim());
  const rows = parsedRows.slice(1).map((row, index) => {
    const values: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      values[header] = (row[headerIndex] ?? "").trim();
    });
    return {
      rowNumber: index + 2,
      values,
    };
  });

  return { headers, rows };
};

const indexRows = (
  rows: Array<{ rowNumber: number; values: Record<string, string> }>,
  keyColumn: string,
  side: "A" | "B",
) => {
  const firstRows = new Map<string, CsvCompareRow>();
  const duplicates: DuplicateCsvKey[] = [];

  for (const row of rows) {
    const key = row.values[keyColumn] ?? "";
    const compareRow: CsvCompareRow = {
      rowNumber: row.rowNumber,
      key,
      values: row.values,
    };
    const firstRow = firstRows.get(key);

    if (firstRow) {
      duplicates.push({
        side,
        rowNumber: row.rowNumber,
        duplicateOfRowNumber: firstRow.rowNumber,
        key,
        values: row.values,
      });
      continue;
    }

    firstRows.set(key, compareRow);
  }

  return { firstRows, duplicates };
};

const getDifferences = (
  headersA: string[],
  headersB: string[],
  rowA: CsvCompareRow,
  rowB: CsvCompareRow,
): CsvDifference[] => {
  const columns = [...new Set([...headersA, ...headersB])];
  const differences: CsvDifference[] = [];

  for (const column of columns) {
    const hasA = Object.prototype.hasOwnProperty.call(rowA.values, column);
    const hasB = Object.prototype.hasOwnProperty.call(rowB.values, column);
    const valueA = hasA ? rowA.values[column] : null;
    const valueB = hasB ? rowB.values[column] : null;

    if (valueA !== valueB) {
      differences.push({ column, valueA, valueB });
    }
  }

  return differences;
};

export const compareCsvs = (
  csvAInput: unknown,
  csvBInput: unknown,
  keyColumnInput: unknown,
): CsvCompareResponse => {
  const csvA = ensureCsv(csvAInput);
  const csvB = ensureCsv(csvBInput);
  const keyColumn = ensureKeyColumn(keyColumnInput);
  const tableA = parseTable(csvA);
  const tableB = parseTable(csvB);

  if (!tableA.headers.includes(keyColumn) || !tableB.headers.includes(keyColumn)) {
    throw new Error(ERROR_MESSAGES.invalidKeyColumn);
  }

  const indexA = indexRows(tableA.rows, keyColumn, "A");
  const indexB = indexRows(tableB.rows, keyColumn, "B");
  const onlyInA: CsvCompareRow[] = [];
  const onlyInB: CsvCompareRow[] = [];
  const modifiedRows = [];

  for (const [key, rowA] of indexA.firstRows.entries()) {
    const rowB = indexB.firstRows.get(key);
    if (!rowB) {
      onlyInA.push(rowA);
      continue;
    }

    const differences = getDifferences(tableA.headers, tableB.headers, rowA, rowB);
    if (differences.length > 0) {
      modifiedRows.push({
        key,
        rowNumberA: rowA.rowNumber,
        rowNumberB: rowB.rowNumber,
        differences,
      });
    }
  }

  for (const [key, rowB] of indexB.firstRows.entries()) {
    if (!indexA.firstRows.has(key)) {
      onlyInB.push(rowB);
    }
  }

  const duplicateKeys = [...indexA.duplicates, ...indexB.duplicates];

  return {
    headersA: tableA.headers,
    headersB: tableB.headers,
    onlyInA,
    onlyInB,
    modifiedRows,
    duplicateKeys,
    summary: {
      rowsA: tableA.rows.length,
      rowsB: tableB.rows.length,
      onlyInA: onlyInA.length,
      onlyInB: onlyInB.length,
      modified: modifiedRows.length,
      duplicateKeys: duplicateKeys.length,
    },
  };
};
