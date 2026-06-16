import { useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../i18n/messages'
import type { CsvCompareResponse, CsvCompareRow } from './types'
import './csv-compare.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const MAX_ROWS = 20

const COPY = {
  en: {
    eyebrow: 'CSV Compare',
    title: 'Reconcile two CSV exports by key',
    description:
      'Compare two CSVs to find records only in one file, modified rows and duplicate keys before importing or reconciling exports.',
    emptyCsvs: 'Paste both CSV inputs before comparing.',
    missingKey: 'Choose a key column before comparing.',
    requestError: 'Could not compare CSVs.',
    row: 'Row',
    key: 'Key',
    keyColumn: 'Key column',
    comparing: 'Comparing...',
    action: 'Compare CSVs',
    rowsA: 'Rows A',
    rowsB: 'Rows B',
    onlyA: 'Only A',
    onlyB: 'Only B',
    modified: 'Modified',
    duplicates: 'Duplicates',
    onlyInA: 'Only in A',
    onlyInB: 'Only in B',
    noOnlyA: 'No rows only in A.',
    noOnlyB: 'No rows only in B.',
    modifiedRows: 'Modified rows',
    noModifiedRows: 'No modified rows.',
    rows: 'Rows',
    differences: 'Differences',
    duplicateKeys: 'Duplicate keys',
    noDuplicateKeys: 'No duplicate keys.',
    side: 'Side',
    duplicateOf: 'Duplicate of',
  },
  es: {
    eyebrow: 'Comparador CSV',
    title: 'Concilia dos exportaciones CSV por clave',
    description:
      'Compara dos CSV para encontrar registros presentes solo en un archivo, filas modificadas y claves duplicadas antes de importar o conciliar exportaciones.',
    emptyCsvs: 'Pega ambos CSV antes de comparar.',
    missingKey: 'Elige una columna clave antes de comparar.',
    requestError: 'No se pudieron comparar los CSV.',
    row: 'Fila',
    key: 'Clave',
    keyColumn: 'Columna clave',
    comparing: 'Comparando...',
    action: 'Comparar CSV',
    rowsA: 'Filas A',
    rowsB: 'Filas B',
    onlyA: 'Solo A',
    onlyB: 'Solo B',
    modified: 'Modificadas',
    duplicates: 'Duplicados',
    onlyInA: 'Solo en A',
    onlyInB: 'Solo en B',
    noOnlyA: 'No hay filas solo en A.',
    noOnlyB: 'No hay filas solo en B.',
    modifiedRows: 'Filas modificadas',
    noModifiedRows: 'No hay filas modificadas.',
    rows: 'Filas',
    differences: 'Diferencias',
    duplicateKeys: 'Claves duplicadas',
    noDuplicateKeys: 'No hay claves duplicadas.',
    side: 'Lado',
    duplicateOf: 'Duplicado de',
  },
} as const

const parseHeaderPreview = (csv: string): string[] => {
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? ''
  return firstLine
    .split(',')
    .map((header) => header.trim().replace(/^"|"$/g, ''))
    .filter((header) => header.length > 0)
}

const displayValue = (value: string | null) => value ?? '—'

function CsvComparePage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [csvA, setCsvA] = useState('')
  const [csvB, setCsvB] = useState('')
  const [keyColumn, setKeyColumn] = useState('')
  const [result, setResult] = useState<CsvCompareResponse | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headersA = useMemo(() => parseHeaderPreview(csvA), [csvA])

  const setCsvAInput = (value: string) => {
    const headers = parseHeaderPreview(value)
    setCsvA(value)
    setError(null)
    setResult(null)

    if (keyColumn.length === 0 || !headers.includes(keyColumn)) {
      setKeyColumn(headers[0] ?? '')
    }
  }

  const compareCsvs = async () => {
    if (csvA.trim().length === 0 || csvB.trim().length === 0) {
      setError(copy.emptyCsvs)
      return
    }

    if (keyColumn.trim().length === 0) {
      setError(copy.missingKey)
      return
    }

    setIsComparing(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/csv-compare/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvA, csvB, keyColumn }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      setResult((await response.json()) as CsvCompareResponse)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsComparing(false)
    }
  }

  const renderRowsTable = (rows: CsvCompareRow[], headers: string[], empty: string) => {
    if (rows.length === 0) {
      return <p className="csv-compare-empty">{empty}</p>
    }

    return (
      <div className="csv-compare-table-wrap">
        <table className="csv-compare-table">
          <thead>
            <tr>
              <th>{copy.row}</th>
              <th>{copy.key}</th>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, MAX_ROWS).map((row) => (
              <tr key={`${row.rowNumber}-${row.key}`}>
                <td>{row.rowNumber}</td>
                <td>{row.key}</td>
                {headers.map((header) => (
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
    <section className="csv-compare-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="csv-compare-panel">
        <div className="csv-input-grid">
          <label>
            <span>CSV A</span>
            <textarea
              value={csvA}
              onChange={(event) => setCsvAInput(event.target.value)}
              placeholder="id,email&#10;1,a@example.com"
            />
          </label>
          <label>
            <span>CSV B</span>
            <textarea
              value={csvB}
              onChange={(event) => {
                setCsvB(event.target.value)
                setError(null)
                setResult(null)
              }}
              placeholder="id,email&#10;1,new@example.com"
            />
          </label>
        </div>

        <div className="csv-compare-controls">
          <label>
            <span>{copy.keyColumn}</span>
            {headersA.length > 0 ? (
              <select value={keyColumn} onChange={(event) => setKeyColumn(event.target.value)}>
                {headersA.map((header) => (
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
                placeholder="id"
              />
            )}
          </label>
          <button
            type="button"
            className="primary-btn"
            disabled={isComparing}
            onClick={() => {
              void compareCsvs()
            }}
          >
            {isComparing ? copy.comparing : copy.action}
          </button>
        </div>

        {error ? <p className="csv-compare-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="csv-compare-results">
          <div className="csv-compare-summary">
            <div>
              <span>{copy.rowsA}</span>
              <strong>{result.summary.rowsA}</strong>
            </div>
            <div>
              <span>{copy.rowsB}</span>
              <strong>{result.summary.rowsB}</strong>
            </div>
            <div>
              <span>{copy.onlyA}</span>
              <strong>{result.summary.onlyInA}</strong>
            </div>
            <div>
              <span>{copy.onlyB}</span>
              <strong>{result.summary.onlyInB}</strong>
            </div>
            <div>
              <span>{copy.modified}</span>
              <strong>{result.summary.modified}</strong>
            </div>
            <div>
              <span>{copy.duplicates}</span>
              <strong>{result.summary.duplicateKeys}</strong>
            </div>
          </div>

          <section className="csv-compare-section">
            <h3>{copy.onlyInA}</h3>
            {renderRowsTable(result.onlyInA, result.headersA, copy.noOnlyA)}
          </section>

          <section className="csv-compare-section">
            <h3>{copy.onlyInB}</h3>
            {renderRowsTable(result.onlyInB, result.headersB, copy.noOnlyB)}
          </section>

          <section className="csv-compare-section">
            <h3>{copy.modifiedRows}</h3>
            {result.modifiedRows.length === 0 ? (
              <p className="csv-compare-empty">{copy.noModifiedRows}</p>
            ) : (
              <div className="csv-compare-table-wrap">
                <table className="csv-compare-table">
                  <thead>
                    <tr>
                      <th>{copy.key}</th>
                      <th>{copy.rows}</th>
                      <th>{copy.differences}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.modifiedRows.slice(0, MAX_ROWS).map((row) => (
                      <tr key={row.key}>
                        <td>{row.key}</td>
                        <td>
                          A {row.rowNumberA} / B {row.rowNumberB}
                        </td>
                        <td>
                          {row.differences
                            .map(
                              (difference) =>
                                `${difference.column}: ${displayValue(
                                  difference.valueA,
                                )} -> ${displayValue(difference.valueB)}`,
                            )
                            .join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="csv-compare-section">
            <h3>{copy.duplicateKeys}</h3>
            {result.duplicateKeys.length === 0 ? (
              <p className="csv-compare-empty">{copy.noDuplicateKeys}</p>
            ) : (
              <div className="csv-compare-table-wrap">
                <table className="csv-compare-table">
                  <thead>
                    <tr>
                      <th>{copy.side}</th>
                      <th>{copy.key}</th>
                      <th>{copy.row}</th>
                      <th>{copy.duplicateOf}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.duplicateKeys.slice(0, MAX_ROWS).map((duplicate) => (
                      <tr key={`${duplicate.side}-${duplicate.rowNumber}-${duplicate.key}`}>
                        <td>{duplicate.side}</td>
                        <td>{duplicate.key}</td>
                        <td>{duplicate.rowNumber}</td>
                        <td>{duplicate.duplicateOfRowNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      ) : null}
    </section>
  )
}

export default CsvComparePage
