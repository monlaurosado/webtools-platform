import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../i18n/messages'
import type { AnalyzePayloadResponse } from './types'
import './payload-inspector.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const SAMPLE_JSON = `{
  "event": "lead.created",
  "lead": {
    "email": "test@example.com",
    "score": 10
  },
  "items": [
    { "id": 1, "name": "A" }
  ]
}`

const COPY = {
  en: {
    eyebrow: 'Payload Inspector',
    title: 'Map JSON payload paths and types',
    description:
      'Paste a webhook or API payload to extract fields, nested paths, array mappings, example values and structural warnings.',
    inputTitle: 'JSON input',
    inputDescription: 'Payloads are parsed locally by the backend and never executed.',
    loadSample: 'Load sample',
    emptyJson: 'Paste JSON before analyzing.',
    requestError: 'Could not analyze payload.',
    analyzing: 'Analyzing...',
    action: 'Analyze payload',
    limit: 'Maximum input size is 1 MB.',
    mapping: 'Mapping',
    rootType: 'Root type',
    fields: 'Fields',
    objects: 'Objects',
    arrays: 'Arrays',
    scalars: 'Scalars',
    warnings: 'Warnings',
    noWarnings: 'No warnings detected.',
    noFields: 'No nested fields detected.',
    path: 'Path',
    type: 'Type',
    example: 'Example',
    warningText: {
      empty_array: 'Array does not contain items.',
      mixed_array_types: 'Array contains multiple item types.',
    },
    types: {
      null: 'null',
      boolean: 'boolean',
      number: 'number',
      string: 'string',
      array: 'array',
      object: 'object',
    },
  },
  es: {
    eyebrow: 'Inspector de cargas JSON',
    title: 'Mapea rutas y tipos de cargas JSON',
    description:
      'Pega un webhook o carga de API para extraer campos, rutas anidadas, mapeos de arrays, valores de ejemplo y avisos estructurales.',
    inputTitle: 'Entrada JSON',
    inputDescription: 'Las cargas se analizan localmente en el backend y nunca se ejecutan.',
    loadSample: 'Cargar ejemplo',
    emptyJson: 'Pega JSON antes de analizar.',
    requestError: 'No se pudo analizar la carga.',
    analyzing: 'Analizando...',
    action: 'Analizar carga',
    limit: 'El tamaño máximo de entrada es 1 MB.',
    mapping: 'Mapeo',
    rootType: 'Tipo raíz',
    fields: 'Campos',
    objects: 'Objetos',
    arrays: 'Arrays',
    scalars: 'Escalares',
    warnings: 'Avisos',
    noWarnings: 'No se detectaron avisos.',
    noFields: 'No se detectaron campos anidados.',
    path: 'Ruta',
    type: 'Tipo',
    example: 'Ejemplo',
    warningText: {
      empty_array: 'El array no contiene elementos.',
      mixed_array_types: 'El array contiene varios tipos de elementos.',
    },
    types: {
      null: 'nulo',
      boolean: 'booleano',
      number: 'número',
      string: 'texto',
      array: 'array',
      object: 'objeto',
    },
  },
} as const

const displayValue = (value: string | null) => value ?? '—'

function PayloadInspectorPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [json, setJson] = useState('')
  const [result, setResult] = useState<AnalyzePayloadResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzePayload = async () => {
    if (json.trim().length === 0) {
      setError(copy.emptyJson)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/payload-inspector/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      setResult((await response.json()) as AnalyzePayloadResponse)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="payload-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="payload-panel">
        <header className="panel-head">
          <div>
            <h3>{copy.inputTitle}</h3>
            <p>{copy.inputDescription}</p>
          </div>
          <button type="button" className="secondary-btn" onClick={() => setJson(SAMPLE_JSON)}>
            {copy.loadSample}
          </button>
        </header>

        <textarea
          className="payload-textarea"
          value={json}
          onChange={(event) => {
            setJson(event.target.value)
            setError(null)
            setResult(null)
          }}
          placeholder='{"event":"lead.created","lead":{"email":"test@example.com"}}'
        />

        <div className="payload-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={isAnalyzing}
            onClick={() => {
              void analyzePayload()
            }}
          >
            {isAnalyzing ? copy.analyzing : copy.action}
          </button>
          <p>{copy.limit}</p>
        </div>

        {error ? <p className="payload-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="payload-results">
          <header className="results-head">
            <div>
              <h3>{copy.mapping}</h3>
              <p>
                {copy.rootType}: {copy.types[result.rootType as keyof typeof copy.types] ?? result.rootType}
              </p>
            </div>
          </header>

          <div className="payload-summary-grid">
            <div>
              <span>{copy.fields}</span>
              <strong>{result.summary.totalFields}</strong>
            </div>
            <div>
              <span>{copy.objects}</span>
              <strong>{result.summary.objects}</strong>
            </div>
            <div>
              <span>{copy.arrays}</span>
              <strong>{result.summary.arrays}</strong>
            </div>
            <div>
              <span>{copy.scalars}</span>
              <strong>{result.summary.scalars}</strong>
            </div>
          </div>

          <section className="payload-section">
            <h4>{copy.warnings}</h4>
            {result.warnings.length === 0 ? (
              <p className="payload-empty">{copy.noWarnings}</p>
            ) : (
              <ul className="payload-warnings">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning.code}-${warning.path}-${index}`}>
                    <span>{warning.code}</span>
                    {warning.path}: {copy.warningText[warning.code] ?? warning.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="payload-section">
            <h4>{copy.fields}</h4>
            {result.fields.length === 0 ? (
              <p className="payload-empty">{copy.noFields}</p>
            ) : (
              <div className="payload-table-wrap">
                <table className="payload-table">
                  <thead>
                    <tr>
                      <th>{copy.path}</th>
                      <th>{copy.type}</th>
                      <th>{copy.example}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fields.map((field) => (
                      <tr key={field.path}>
                        <td>
                          <code>{field.path}</code>
                        </td>
                        <td>{copy.types[field.type as keyof typeof copy.types] ?? field.type}</td>
                        <td>{displayValue(field.example)}</td>
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

export default PayloadInspectorPage
