export interface CsvCompareRow {
  rowNumber: number;
  key: string;
  values: Record<string, string>;
}

export interface CsvDifference {
  column: string;
  valueA: string | null;
  valueB: string | null;
}

export interface ModifiedCsvRow {
  key: string;
  rowNumberA: number;
  rowNumberB: number;
  differences: CsvDifference[];
}

export interface DuplicateCsvKey {
  side: "A" | "B";
  rowNumber: number;
  duplicateOfRowNumber: number;
  key: string;
  values: Record<string, string>;
}

export interface CsvCompareSummary {
  rowsA: number;
  rowsB: number;
  onlyInA: number;
  onlyInB: number;
  modified: number;
  duplicateKeys: number;
}

export interface CsvCompareResponse {
  headersA: string[];
  headersB: string[];
  onlyInA: CsvCompareRow[];
  onlyInB: CsvCompareRow[];
  modifiedRows: ModifiedCsvRow[];
  duplicateKeys: DuplicateCsvKey[];
  summary: CsvCompareSummary;
}
