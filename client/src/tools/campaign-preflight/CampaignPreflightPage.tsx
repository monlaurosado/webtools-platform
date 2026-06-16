import { useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  readApiErrorMessage,
  translateServerMessage,
  translateUrlError,
} from '../../i18n/messages'
import { getFormWarningText } from '../form-inspector/warningText'
import type { FormWarningCode } from '../form-inspector/types'
import type { CampaignPreflightResponse, CampaignPreflightWarning } from './types'
import './campaign-preflight.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const COPY = {
  en: {
    eyebrow: 'Campaign Preflight',
    title: 'Run a technical QA pass before launch',
    description:
      'Combine form, tracking and optional URL checks into one preflight score for campaign and landing QA.',
    landingHtml: 'Landing HTML',
    urlsToCheck: 'URLs to check',
    emptyHtml: 'Paste landing HTML before running preflight.',
    requestError: 'Could not run preflight.',
    running: 'Running...',
    action: 'Run preflight',
    queued: (count: number) =>
      `${count} URL${count === 1 ? '' : 's'} queued. Internal URLs are blocked.`,
    score: 'Score',
    risk: {
      low: 'low risk',
      medium: 'medium risk',
      high: 'high risk',
    },
    forms: 'Forms',
    formWarnings: 'Form warnings',
    scripts: 'Scripts',
    trackingWarnings: 'Tracking warnings',
    urls: 'URLs',
    urlFailures: 'URL failures',
    warnings: 'Warnings',
    noWarnings: 'No warnings detected.',
    noForms: 'No forms detected.',
    actionColumn: 'Action',
    method: 'Method',
    tracking: 'Tracking',
    noScripts: 'No scripts detected.',
    provider: 'Provider',
    identifier: 'Identifier',
    noUrls: 'No URLs checked.',
    url: 'URL',
    status: 'Status',
    finalUrl: 'Final URL',
    error: 'Error',
    form: 'Form',
    areas: {
      forms: 'Forms',
      tracking: 'Tracking',
      urls: 'URLs',
      general: 'General',
    },
    trackingWarningText: {
      duplicate_src: 'External script src appears more than once.',
      duplicate_provider_id: 'Provider identifier appears more than once.',
    },
    noFormsWarning: 'No forms were detected in the HTML.',
    noTrackingWarning: 'No supported tracking providers were detected.',
  },
  es: {
    eyebrow: 'Revisión previa de campaña',
    title: 'Ejecuta control técnico antes del lanzamiento',
    description:
      'Combina comprobaciones de formularios, seguimiento y URLs opcionales en una puntuación de revisión previa para campañas y páginas de destino.',
    landingHtml: 'HTML de la página de destino',
    urlsToCheck: 'URLs a comprobar',
    emptyHtml: 'Pega el HTML de la página de destino antes de ejecutar la revisión.',
    requestError: 'No se pudo ejecutar la revisión.',
    running: 'Ejecutando...',
    action: 'Ejecutar revisión',
    queued: (count: number) =>
      `${count} ${count === 1 ? 'URL en cola' : 'URLs en cola'}. Las URLs internas se bloquean.`,
    score: 'Puntuación',
    risk: {
      low: 'riesgo bajo',
      medium: 'riesgo medio',
      high: 'riesgo alto',
    },
    forms: 'Formularios',
    formWarnings: 'Avisos de formularios',
    scripts: 'Scripts',
    trackingWarnings: 'Avisos de seguimiento',
    urls: 'URLs',
    urlFailures: 'Fallos de URL',
    warnings: 'Avisos',
    noWarnings: 'No se detectaron avisos.',
    noForms: 'No se detectaron formularios.',
    actionColumn: 'Acción',
    method: 'Método',
    tracking: 'Seguimiento',
    noScripts: 'No se detectaron scripts.',
    provider: 'Proveedor',
    identifier: 'Identificador',
    noUrls: 'No se comprobaron URLs.',
    url: 'URL',
    status: 'Estado',
    finalUrl: 'URL final',
    error: 'Error',
    form: 'Formulario',
    areas: {
      forms: 'Formularios',
      tracking: 'Seguimiento',
      urls: 'URLs',
      general: 'General',
    },
    trackingWarningText: {
      duplicate_src: 'El src del script externo aparece más de una vez.',
      duplicate_provider_id: 'El identificador del proveedor aparece más de una vez.',
    },
    noFormsWarning: 'No se detectaron formularios en el HTML.',
    noTrackingWarning: 'No se detectaron proveedores de seguimiento compatibles.',
  },
} as const

const parseUrls = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

const displayValue = (value: string | number | null) => {
  if (value == null) {
    return '—'
  }
  return String(value)
}

const translateUrlWarningMessage = (message: string, language: 'en' | 'es') => {
  if (language === 'en') {
    return message
  }

  const separatorIndex = message.indexOf(': ')
  if (separatorIndex === -1) {
    return translateServerMessage(message, language)
  }

  const url = message.slice(0, separatorIndex)
  const detail = message.slice(separatorIndex + 2)
  return `${url}: ${translateServerMessage(detail, language)}`
}

function CampaignPreflightPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [html, setHtml] = useState('')
  const [urlText, setUrlText] = useState('')
  const [result, setResult] = useState<CampaignPreflightResponse | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urls = useMemo(() => parseUrls(urlText), [urlText])

  const runPreflight = async () => {
    if (html.trim().length === 0) {
      setError(copy.emptyHtml)
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/campaign-preflight/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html, urls }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      setResult((await response.json()) as CampaignPreflightResponse)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsRunning(false)
    }
  }

  const translateWarning = (warning: CampaignPreflightWarning) => {
    if (warning.area === 'forms') {
      const formMatch = /^Form (\d+): /.exec(warning.message)
      const fallback = formMatch
        ? warning.message.slice(formMatch[0].length)
        : warning.message
      const text = getFormWarningText(
        warning.code as FormWarningCode,
        language,
        fallback,
      )

      return formMatch ? `${copy.form} ${formMatch[1]}: ${text}` : text
    }

    if (warning.area === 'tracking') {
      return (
        copy.trackingWarningText[
          warning.code as keyof typeof copy.trackingWarningText
        ] ?? warning.message
      )
    }

    if (warning.code === 'no_forms') {
      return copy.noFormsWarning
    }

    if (warning.code === 'no_tracking') {
      return copy.noTrackingWarning
    }

    if (warning.area === 'urls') {
      return translateUrlWarningMessage(warning.message, language)
    }

    return language === 'es'
      ? translateServerMessage(warning.message, language)
      : warning.message
  }

  return (
    <section className="preflight-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="preflight-panel">
        <div className="preflight-input-grid">
          <label>
            <span>{copy.landingHtml}</span>
            <textarea
              value={html}
              onChange={(event) => {
                setHtml(event.target.value)
                setError(null)
                setResult(null)
              }}
              placeholder="<form action=&quot;/lead&quot; method=&quot;post&quot;>...</form>"
            />
          </label>
          <label>
            <span>{copy.urlsToCheck}</span>
            <textarea
              value={urlText}
              onChange={(event) => {
                setUrlText(event.target.value)
                setError(null)
                setResult(null)
              }}
              placeholder="https://example.com&#10;https://example.com/thank-you"
            />
          </label>
        </div>

        <div className="preflight-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={isRunning}
            onClick={() => {
              void runPreflight()
            }}
          >
            {isRunning ? copy.running : copy.action}
          </button>
          <p>{copy.queued(urls.length)}</p>
        </div>

        {error ? <p className="preflight-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="preflight-results">
          <div className={`preflight-score is-${result.riskLevel}`}>
            <span>{copy.score}</span>
            <strong>{result.score}</strong>
            <p>{copy.risk[result.riskLevel]}</p>
          </div>

          <div className="preflight-summary">
            <div>
              <span>{copy.forms}</span>
              <strong>{result.summary.forms}</strong>
            </div>
            <div>
              <span>{copy.formWarnings}</span>
              <strong>{result.summary.formWarnings}</strong>
            </div>
            <div>
              <span>{copy.scripts}</span>
              <strong>{result.summary.scripts}</strong>
            </div>
            <div>
              <span>{copy.trackingWarnings}</span>
              <strong>{result.summary.trackingWarnings}</strong>
            </div>
            <div>
              <span>{copy.urls}</span>
              <strong>{result.summary.urls}</strong>
            </div>
            <div>
              <span>{copy.urlFailures}</span>
              <strong>{result.summary.urlFailures}</strong>
            </div>
          </div>

          <section className="preflight-section">
            <h3>{copy.warnings}</h3>
            {result.warnings.length === 0 ? (
              <p className="preflight-empty">{copy.noWarnings}</p>
            ) : (
              <ul className="preflight-warnings">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning.area}-${warning.code}-${index}`}>
                    <span>{copy.areas[warning.area]}</span>
                    {translateWarning(warning)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="preflight-section">
            <h3>{copy.forms}</h3>
            {result.checks.forms.forms.length === 0 ? (
              <p className="preflight-empty">{copy.noForms}</p>
            ) : (
              <div className="preflight-table-wrap">
                <table className="preflight-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{copy.actionColumn}</th>
                      <th>{copy.method}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.checks.forms.forms.map((form) => (
                      <tr key={form.index}>
                        <td>{form.index + 1}</td>
                        <td>{displayValue(form.action)}</td>
                        <td>{displayValue(form.method)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="preflight-section">
            <h3>{copy.tracking}</h3>
            {result.checks.tracking.scripts.length === 0 ? (
              <p className="preflight-empty">{copy.noScripts}</p>
            ) : (
              <div className="preflight-table-wrap">
                <table className="preflight-table">
                  <thead>
                    <tr>
                      <th>{copy.provider}</th>
                      <th>{copy.identifier}</th>
                      <th>Src</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.checks.tracking.scripts.map((script, index) => (
                      <tr key={`${script.provider ?? 'script'}-${index}`}>
                        <td>{displayValue(script.provider)}</td>
                        <td>{displayValue(script.identifier)}</td>
                        <td>{displayValue(script.src)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="preflight-section">
            <h3>{copy.urls}</h3>
            {result.checks.urls.results.length === 0 ? (
              <p className="preflight-empty">{copy.noUrls}</p>
            ) : (
              <div className="preflight-table-wrap">
                <table className="preflight-table">
                  <thead>
                    <tr>
                      <th>{copy.url}</th>
                      <th>{copy.status}</th>
                      <th>{copy.finalUrl}</th>
                      <th>{copy.error}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.checks.urls.results.map((item) => (
                      <tr key={item.inputUrl}>
                        <td>{item.inputUrl}</td>
                        <td>{displayValue(item.statusCode)}</td>
                        <td>{displayValue(item.finalUrl)}</td>
                        <td>{displayValue(translateUrlError(item.error, language))}</td>
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

export default CampaignPreflightPage
