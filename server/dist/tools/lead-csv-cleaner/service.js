"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanLeadCsv = exports.ERROR_MESSAGES = exports.MAX_CSV_BYTES = void 0;
exports.MAX_CSV_BYTES = 1024 * 1024;
exports.ERROR_MESSAGES = {
    invalidCsv: "Invalid csv. Expected string.",
    invalidKeyColumn: "Invalid keyColumn. Expected existing CSV header.",
    csvTooLarge: "CSV input exceeds the 1 MB limit.",
    missingHeader: "CSV must include a header row.",
    malformedCsv: "Malformed CSV input.",
};
const ensureCsv = (csv) => {
    if (typeof csv !== "string") {
        throw new Error(exports.ERROR_MESSAGES.invalidCsv);
    }
    if (Buffer.byteLength(csv, "utf8") > exports.MAX_CSV_BYTES) {
        throw new Error(exports.ERROR_MESSAGES.csvTooLarge);
    }
    return csv;
};
const ensureKeyColumn = (keyColumn) => {
    if (typeof keyColumn !== "string" || keyColumn.trim().length === 0) {
        throw new Error(exports.ERROR_MESSAGES.invalidKeyColumn);
    }
    return keyColumn.trim();
};
const stripBom = (value) => {
    return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
};
const parseCsv = (csvInput) => {
    const csv = stripBom(csvInput);
    const rows = [];
    let currentRow = [];
    let currentValue = "";
    let inQuotes = false;
    for (let index = 0; index < csv.length; index += 1) {
        const char = csv[index];
        const nextChar = csv[index + 1];
        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentValue += '"';
                index += 1;
                continue;
            }
            if (char === '"') {
                inQuotes = false;
                continue;
            }
            currentValue += char;
            continue;
        }
        if (char === '"') {
            if (currentValue.length > 0) {
                throw new Error(exports.ERROR_MESSAGES.malformedCsv);
            }
            inQuotes = true;
            continue;
        }
        if (char === ",") {
            currentRow.push(currentValue);
            currentValue = "";
            continue;
        }
        if (char === "\n") {
            currentRow.push(currentValue);
            rows.push(currentRow);
            currentRow = [];
            currentValue = "";
            continue;
        }
        if (char === "\r") {
            if (nextChar === "\n") {
                continue;
            }
            currentRow.push(currentValue);
            rows.push(currentRow);
            currentRow = [];
            currentValue = "";
            continue;
        }
        currentValue += char;
    }
    if (inQuotes) {
        throw new Error(exports.ERROR_MESSAGES.malformedCsv);
    }
    currentRow.push(currentValue);
    rows.push(currentRow);
    return rows.filter((row, index) => {
        if (index === 0) {
            return true;
        }
        return row.some((value) => value.trim().length > 0);
    });
};
const normalizeHeader = (value) => value.trim();
const isEmailColumn = (header) => {
    return header.toLowerCase().includes("email");
};
const cleanCell = (header, value) => {
    const trimmedValue = (value ?? "").trim();
    return isEmailColumn(header) ? trimmedValue.toLowerCase() : trimmedValue;
};
const createRowValues = (headers, row) => {
    const values = {};
    headers.forEach((header, index) => {
        values[header] = cleanCell(header, row[index]);
    });
    return values;
};
const escapeCsvCell = (value) => {
    if (!/[",\n\r]/.test(value)) {
        return value;
    }
    return `"${value.replace(/"/g, '""')}"`;
};
const serializeCsv = (headers, rows) => {
    const lines = [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((row) => headers.map((header) => escapeCsvCell(row.values[header] ?? "")).join(",")),
    ];
    return lines.join("\n");
};
const cleanLeadCsv = (csvInput, keyColumnInput) => {
    const csv = ensureCsv(csvInput);
    const keyColumn = ensureKeyColumn(keyColumnInput);
    const parsedRows = parseCsv(csv);
    if (parsedRows.length === 0 || parsedRows[0].every((cell) => cell.trim().length === 0)) {
        throw new Error(exports.ERROR_MESSAGES.missingHeader);
    }
    const headers = parsedRows[0].map(normalizeHeader);
    const keyHeader = headers.find((header) => header === keyColumn);
    if (!keyHeader) {
        throw new Error(exports.ERROR_MESSAGES.invalidKeyColumn);
    }
    const cleanRows = [];
    const duplicateRows = [];
    const warnings = [];
    const seenKeys = new Map();
    let emptyKeyRows = 0;
    parsedRows.slice(1).forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 2;
        if (row.length !== headers.length) {
            warnings.push({
                code: "column_count_mismatch",
                message: "Row has a different number of columns than the header.",
                rowNumber,
            });
        }
        const values = createRowValues(headers, row);
        const rowData = { rowNumber, values };
        const key = values[keyHeader] ?? "";
        if (key.length === 0) {
            emptyKeyRows += 1;
            warnings.push({
                code: "empty_key",
                message: "Row has an empty key column value.",
                rowNumber,
            });
            cleanRows.push(rowData);
            return;
        }
        const firstRowNumber = seenKeys.get(key);
        if (firstRowNumber != null) {
            duplicateRows.push({
                ...rowData,
                duplicateOfRowNumber: firstRowNumber,
                key,
            });
            return;
        }
        seenKeys.set(key, rowNumber);
        cleanRows.push(rowData);
    });
    return {
        headers,
        cleanRows,
        duplicateRows,
        summary: {
            totalRows: parsedRows.length - 1,
            cleanRows: cleanRows.length,
            duplicateRows: duplicateRows.length,
            emptyKeyRows,
        },
        warnings,
        cleanCsv: serializeCsv(headers, cleanRows),
        duplicateCsv: serializeCsv(headers, duplicateRows),
    };
};
exports.cleanLeadCsv = cleanLeadCsv;
