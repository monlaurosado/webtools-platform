import { useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../i18n/messages'
import type { CleanCsvResponse, CopyState, CopyTarget, CsvRow } from './types'
import './lead-csv-cleaner.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const MAX_PREVIEW_ROWS = 25

const COPY = {
  en: {
    eyebrow: 'Lead CSV Cleaner',
    title: 'Clean and deduplicate lead exports',
    description:
      'Paste CSV, choose a key column, normalize email casing, trim cells and split duplicate leads into a separate export.',
    inputTitle: 'CSV input',
    inputDescription: 'Use comma-separated CSV with a header row.',
    limit: '1 MB max',
    keyColumn: 'Key column',
    emptyCsv: 'Paste CSV before cleaning.',
    missingKey: 'Choose a key column before cleaning.',
    requestError: 'Could not clean CSV.',
    cleaning: 'Cleaning...',
    action: 'Clean CSV',
    row: 'Row',
    results: 'Results',
    processed: (count: number) => `${count} data rows processed.`,
    totalRows: 'Total rows',
    cleanRows: 'Clean rows',
    duplicates: 'Duplicates',
    emptyKeys: 'Empty keys',
    warnings: 'Warnings',
    noWarnings: 'No warnings detected.',
    cleanRowsTitle: 'Clean rows',
    duplicateRowsTitle: 'Duplicate rows',
    noCleanRows: 'No clean rows returned.',
    noDuplicates: 'No duplicates found.',
    cleanCsv: 'Clean CSV',
    duplicateCsv: 'Duplicate CSV',
    copied: 'Copied',
    unavailable: 'Unavailable',
    copy: 'Copy',
    placeholder:
      'email,name\nTest@Example.com,Alice\ntest@example.com,Alice duplicate',
    warningText: {
      empty_key: 'Row has an empty key column value.',
      column_count_mismatch:
        'Row has a different number of columns than the header.',
    },
  },
  es: {
    eyebrow: 'Limpiador de leads CSV',
    title: 'Limpia y deduplica exportaciones de leads',
    description:
      'Pega CSV, elige una columna clave, normaliza mayúsculas en correos electrónicos, recorta celdas y separa leads duplicados en una exportación independiente.',
    inputTitle: 'Entrada CSV',
    inputDescription: 'Usa CSV separado por comas con una fila de cabecera.',
    limit: '1 MB máximo',
    keyColumn: 'Columna clave',
    emptyCsv: 'Pega CSV antes de limpiarlo.',
    missingKey: 'Elige una columna clave antes de limpiar.',
    requestError: 'No se pudo limpiar el CSV.',
    cleaning: 'Limpiando...',
    action: 'Limpiar CSV',
    row: 'Fila',
    results: 'Resultados',
    processed: (count: number) =>
      `${count} ${count === 1 ? 'fila de datos procesada' : 'filas de datos procesadas'}.`,
    totalRows: 'Filas totales',
    cleanRows: 'Filas limpias',
    duplicates: 'Duplicados',
    emptyKeys: 'Claves vacías',
    warnings: 'Avisos',
    noWarnings: 'No se detectaron avisos.',
    cleanRowsTitle: 'Filas limpias',
    duplicateRowsTitle: 'Filas duplicadas',
    noCleanRows: 'No se devolvieron filas limpias.',
    noDuplicates: 'No se encontraron duplicados.',
    cleanCsv: 'CSV limpio',
    duplicateCsv: 'CSV de duplicados',
    copied: 'Copiado',
    unavailable: 'No disponible',
    copy: 'Copiar',
    placeholder:
      'email,nombre\nTest@Example.com,Alicia\ntest@example.com,Alicia duplicada',
    warningText: {
      empty_key: 'La fila tiene vacía la columna clave.',
      column_count_mismatch:
        'La fila tiene un número de columnas diferente al de la cabecera.',
    },
  },
} as const

const parseHeaderPreview = (csv: string): string[] => {
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? ''
  if (firstLine.trim().length === 0) {
    return []
  }

  return firstLine
    .split(',')
    .map((header) => header.trim().replace(/^"|"$/g, ''))
    .filter((header) => header.length > 0)
}

const sampleRows = (rows: CsvRow[]) => rows.slice(0, MAX_PREVIEW_ROWS)

function LeadCsvCleanerPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [csv, setCsv] = useState('')
  const [keyColumn, setKeyColumn] = useState('')
  const [result, setResult] = useState<CleanCsvResponse | null>(null)
  const [isCleaning, setIsCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<Record<CopyTarget, CopyState>>({
    clean: 'idle',
    duplicates: 'idle',
  })

  const detectedHeaders = useMemo(() => parseHeaderPreview(csv), [csv])

  const setCsvInput = (nextCsv: string) => {
    const nextHeaders = parseHeaderPreview(nextCsv)
    setCsv(nextCsv)
    setError(null)
    setResult(null)

    if (keyColumn.length === 0 || !nextHeaders.includes(keyColumn)) {
      setKeyColumn(nextHeaders[0] ?? '')
    }
  }

  const cleanCsv = async () => {
    if (csv.trim().length === 0) {
      setError(copy.emptyCsv)
      return
    }

    if (keyColumn.trim().length === 0) {
      setError(copy.missingKey)
      return
    }

    setIsCleaning(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/lead-csv-cleaner/clean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csv,
          keyColumn,
        }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      const payload = (await response.json()) as CleanCsvResponse
      setResult(payload)
      setCopyState({ clean: 'idle', duplicates: 'idle' })
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsCleaning(false)
    }
  }

  const copyOutput = async (target: CopyTarget) => {
    if (!result || !navigator.clipboard) {
      setCopyState((current) => ({ ...current, [target]: 'error' }))
      return
    }

    const text = target === 'clean' ? result.cleanCsv : result.duplicateCsv

    try {
      await navigator.clipboard.writeText(text)
      setCopyState((current) => ({ ...current, [target]: 'copied' }))
      window.setTimeout(() => {
        setCopyState((current) => ({ ...current, [target]: 'idle' }))
      }, 1800)
    } catch {
      setCopyState((current) => ({ ...current, [target]: 'error' }))
    }
  }

  const renderTable = (rows: CsvRow[], emptyMessage: string) => {
    if (!result || rows.length === 0) {
      return <p className="csv-empty">{emptyMessage}</p>
    }

    return (
      <div className="csv-table-wrap">
        <table className="csv-table">
          <thead>
            <tr>
              <th>{copy.row}</th>
              {result.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows(rows).map((row) => (
              <tr key={row.rowNumber}>
                <td>{row.rowNumber}</td>
                {result.headers.map((header) => (
                  <td key={`${row.rowNumber}-${header}`}>{row.values[header] ?? ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="lead-csv-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="csv-panel">
        <header className="panel-head">
          <div>
            <h3>{copy.inputTitle}</h3>
            <p>{copy.inputDescription}</p>
          </div>
          <span className="csv-limit">{copy.limit}</span>
        </header>

        <textarea
          className="csv-textarea"
          value={csv}
          onChange={(event) => setCsvInput(event.target.value)}
          placeholder={copy.placeholder}
        />

        <div className="csv-controls">
          <label>
            <span>{copy.keyColumn}</span>
            {detectedHeaders.length > 0 ? (
              <select value={keyColumn} onChange={(event) => setKeyColumn(event.target.value)}>
                {detectedHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={keyColumn}
                onChange={(event) => setKeyColumn(event.target.value)}
                placeholder="email"
              />
            )}
          </label>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              void cleanCsv()
            }}
            disabled={isCleaning}
          >
            {isCleaning ? copy.cleaning : copy.action}
          </button>
        </div>

        {error ? <p className="csv-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="csv-results">
          <header className="results-head">
            <div>
              <h3>{copy.results}</h3>
              <p>{copy.processed(result.summary.totalRows)}</p>
            </div>
          </header>

          <div className="csv-summary-grid">
            <div>
              <span>{copy.totalRows}</span>
              <strong>{result.summary.totalRows}</strong>
            </div>
            <div>
              <span>{copy.cleanRows}</span>
              <strong>{result.summary.cleanRows}</strong>
            </div>
            <div>
              <span>{copy.duplicates}</span>
              <strong>{result.summary.duplicateRows}</strong>
            </div>
            <div>
              <span>{copy.emptyKeys}</span>
              <strong>{result.summary.emptyKeyRows}</strong>
            </div>
          </div>

          <section className="csv-section">
            <h4>{copy.warnings}</h4>
            {result.warnings.length === 0 ? (
              <p className="csv-empty">{copy.noWarnings}</p>
            ) : (
              <ul className="csv-warnings">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning.code}-${warning.rowNumber}-${index}`}>
                    <span>{warning.code}</span>
                    {copy.row} {warning.rowNumber}:{' '}
                    {copy.warningText[warning.code] ?? warning.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="csv-section">
            <h4>{copy.cleanRowsTitle}</h4>
            {renderTable(result.cleanRows, copy.noCleanRows)}
          </section>

          <section className="csv-section">
            <h4>{copy.duplicateRowsTitle}</h4>
            {renderTable(result.duplicateRows, copy.noDuplicates)}
          </section>

          <div className="csv-exports">
            <section className="csv-export">
              <header>
                <h4>{copy.cleanCsv}</h4>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    void copyOutput('clean')
                  }}
                >
                  {copyState.clean === 'copied'
                    ? copy.copied
                    : copyState.clean === 'error'
                      ? copy.unavailable
                      : copy.copy}
                </button>
              </header>
              <textarea value={result.cleanCsv} readOnly />
            </section>

            <section className="csv-export">
              <header>
                <h4>{copy.duplicateCsv}</h4>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    void copyOutput('duplicates')
                  }}
                >
                  {copyState.duplicates === 'copied'
                    ? copy.copied
                    : copyState.duplicates === 'error'
                      ? copy.unavailable
                      : copy.copy}
                </button>
              </header>
              <textarea value={result.duplicateCsv} readOnly />
            </section>
          </div>
        </section>
      ) : null}
    </section>
  )
}

export default LeadCsvCleanerPage
