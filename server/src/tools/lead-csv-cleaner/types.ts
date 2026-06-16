export type CsvCleanerWarningCode = "empty_key" | "column_count_mismatch";

export interface CsvRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface DuplicateCsvRow extends CsvRow {
  duplicateOfRowNumber: number;
  key: string;
}

export interface CsvCleanerWarning {
  code: CsvCleanerWarningCode;
  message: string;
  rowNumber: number;
}

export interface CsvCleanerSummary {
  totalRows: number;
  cleanRows: number;
  duplicateRows: number;
  emptyKeyRows: number;
}

export interface CleanCsvResponse {
  headers: string[];
  cleanRows: CsvRow[];
  duplicateRows: DuplicateCsvRow[];
  summary: CsvCleanerSummary;
  warnings: CsvCleanerWarning[];
  cleanCsv: string;
  duplicateCsv: string;
}
