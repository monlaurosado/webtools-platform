import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../i18n/messages'
import type { AnalyzeTrackingResponse } from './types'
import './tracking-inspector.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const COPY = {
  en: {
    eyebrow: 'Tracking Inspector',
    title: 'Detect pixels, scripts and duplicate tags',
    description:
      'Paste HTML to identify GTM, GA, Meta Pixel, TikTok Pixel, Hotjar, Clarity and duplicated tracking scripts without executing markup.',
    inputTitle: 'HTML input',
    inputDescription: 'Scripts are parsed as text and never executed.',
    limit: '1 MB max',
    emptyHtml: 'Paste HTML before inspecting tracking.',
    requestError: 'Could not inspect tracking.',
    inspecting: 'Inspecting...',
    action: 'Inspect tracking',
    note: 'Provider detection uses script src and inline signatures.',
    totalScripts: 'Total scripts',
    external: 'External',
    externalType: 'External',
    inline: 'Inline',
    inlineType: 'Inline',
    providers: 'Providers',
    warnings: 'Warnings',
    noWarnings: 'No warnings detected.',
    scripts: 'Scripts',
    noScripts: 'No scripts found.',
    provider: 'Provider',
    identifier: 'Identifier',
    type: 'Type',
    location: 'Location',
    scriptIndexes: 'Scripts',
    locations: {
      head: 'head',
      body: 'body',
      unknown: 'unknown',
    },
    warningText: {
      duplicate_src: 'External script src appears more than once.',
      duplicate_provider_id: 'Provider identifier appears more than once.',
    },
  },
  es: {
    eyebrow: 'Inspector de seguimiento',
    title: 'Detecta píxeles, scripts y etiquetas duplicadas',
    description:
      'Pega HTML para identificar GTM, GA, Meta Pixel, TikTok Pixel, Hotjar, Clarity y scripts de seguimiento duplicados sin ejecutar el marcado.',
    inputTitle: 'Entrada HTML',
    inputDescription: 'Los scripts se analizan como texto y nunca se ejecutan.',
    limit: '1 MB máximo',
    emptyHtml: 'Pega HTML antes de inspeccionar el seguimiento.',
    requestError: 'No se pudo inspeccionar el seguimiento.',
    inspecting: 'Inspeccionando...',
    action: 'Inspeccionar seguimiento',
    note: 'La detección de proveedores usa el src del script y firmas embebidas.',
    totalScripts: 'Scripts totales',
    external: 'Externos',
    externalType: 'Externo',
    inline: 'Embebidos',
    inlineType: 'Embebido',
    providers: 'Proveedores',
    warnings: 'Avisos',
    noWarnings: 'No se detectaron avisos.',
    scripts: 'Scripts',
    noScripts: 'No se encontraron scripts.',
    provider: 'Proveedor',
    identifier: 'Identificador',
    type: 'Tipo',
    location: 'Ubicación',
    scriptIndexes: 'Scripts',
    locations: {
      head: 'cabecera',
      body: 'cuerpo',
      unknown: 'desconocida',
    },
    warningText: {
      duplicate_src: 'El src del script externo aparece más de una vez.',
      duplicate_provider_id: 'El identificador del proveedor aparece más de una vez.',
    },
  },
} as const

const displayValue = (value: string | null) => value ?? '—'

function TrackingInspectorPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [html, setHtml] = useState('')
  const [result, setResult] = useState<AnalyzeTrackingResponse | null>(null)
  const [isInspecting, setIsInspecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inspectTracking = async () => {
    if (html.trim().length === 0) {
      setError(copy.emptyHtml)
      return
    }

    setIsInspecting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/tracking-inspector/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      setResult((await response.json()) as AnalyzeTrackingResponse)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsInspecting(false)
    }
  }

  return (
    <section className="tracking-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="tracking-panel">
        <header className="panel-head">
          <div>
            <h3>{copy.inputTitle}</h3>
            <p>{copy.inputDescription}</p>
          </div>
          <span className="tracking-limit">{copy.limit}</span>
        </header>

        <textarea
          className="tracking-textarea"
          value={html}
          onChange={(event) => {
            setHtml(event.target.value)
            setError(null)
            setResult(null)
          }}
          placeholder="<script src=&quot;https://www.googletagmanager.com/gtm.js?id=GTM-ABC&quot;></script>"
        />

        <div className="tracking-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={isInspecting}
            onClick={() => {
              void inspectTracking()
            }}
          >
            {isInspecting ? copy.inspecting : copy.action}
          </button>
          <p>{copy.note}</p>
        </div>

        {error ? <p className="tracking-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="tracking-results">
          <div className="tracking-summary">
            <div>
              <span>{copy.totalScripts}</span>
              <strong>{result.summary.totalScripts}</strong>
            </div>
            <div>
              <span>{copy.external}</span>
              <strong>{result.summary.externalScripts}</strong>
            </div>
            <div>
              <span>{copy.inline}</span>
              <strong>{result.summary.inlineScripts}</strong>
            </div>
            <div>
              <span>{copy.providers}</span>
              <strong>{result.summary.detectedProviders}</strong>
            </div>
            <div>
              <span>{copy.warnings}</span>
              <strong>{result.summary.warnings}</strong>
            </div>
          </div>

          <section className="tracking-section">
            <h3>{copy.warnings}</h3>
            {result.warnings.length === 0 ? (
              <p className="tracking-empty">{copy.noWarnings}</p>
            ) : (
              <ul className="tracking-warnings">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning.code}-${index}`}>
                    <span>{warning.code}</span>
                    {copy.warningText[warning.code] ?? warning.message} {copy.scriptIndexes}:{' '}
                    {warning.scriptIndexes.map((item) => item + 1).join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="tracking-section">
            <h3>{copy.scripts}</h3>
            {result.scripts.length === 0 ? (
              <p className="tracking-empty">{copy.noScripts}</p>
            ) : (
              <div className="tracking-table-wrap">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{copy.provider}</th>
                      <th>{copy.identifier}</th>
                      <th>{copy.type}</th>
                      <th>{copy.location}</th>
                      <th>Src</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scripts.map((script) => (
                      <tr key={script.index}>
                        <td>{script.index + 1}</td>
                        <td>{displayValue(script.provider)}</td>
                        <td>{displayValue(script.identifier)}</td>
                        <td>{script.inline ? copy.inlineType : copy.externalType}</td>
                        <td>{copy.locations[script.location] ?? script.location}</td>
                        <td>{displayValue(script.src)}</td>
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

export default TrackingInspectorPage
