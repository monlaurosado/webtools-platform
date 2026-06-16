import { useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage, translateUrlError } from '../../i18n/messages'
import type { InspectUrlsResponse } from './types'
import './url-status-checker.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const COPY = {
  en: {
    eyebrow: 'URL Status Checker',
    title: 'Inspect status codes and redirects in batch',
    description:
      'Paste one HTTP or HTTPS URL per line. Internal hosts and private network destinations are blocked before requests are made.',
    panelTitle: 'URLs',
    panelDescription: 'Maximum 50 URLs per request.',
    queued: 'queued',
    placeholder: 'https://example.com\nhttps://example.com/old-page',
    emptyError: 'Paste at least one URL before checking.',
    requestError: 'Could not check URLs.',
    checking: 'Checking...',
    action: 'Check URLs',
    note: 'Redirects are inspected manually with SSRF protections.',
    results: 'Results',
    inspected: (count: number) => `${count} URL${count === 1 ? '' : 's'} inspected.`,
    total: 'Total',
    ok: 'OK',
    redirected: 'Redirected',
    failed: 'Failed',
    blocked: 'Blocked',
    inputUrl: 'Input URL',
    status: 'Status',
    finalUrl: 'Final URL',
    redirects: 'Redirects',
    error: 'Error',
    noRedirects: 'No redirects',
    hop: 'Hop',
  },
  es: {
    eyebrow: 'Comprobador de estado de URLs',
    title: 'Inspecciona códigos de estado y redirecciones por lotes',
    description:
      'Pega una URL HTTP o HTTPS por línea. Los hosts internos y destinos de redes privadas se bloquean antes de hacer peticiones.',
    panelTitle: 'URLs',
    panelDescription: 'Máximo 50 URLs por petición.',
    queued: 'en cola',
    placeholder: 'https://example.com\nhttps://example.com/old-page',
    emptyError: 'Pega al menos una URL antes de comprobar.',
    requestError: 'No se pudieron comprobar las URLs.',
    checking: 'Comprobando...',
    action: 'Comprobar URLs',
    note: 'Las redirecciones se inspeccionan manualmente con protección SSRF.',
    results: 'Resultados',
    inspected: (count: number) =>
      `${count} ${count === 1 ? 'URL inspeccionada' : 'URLs inspeccionadas'}.`,
    total: 'Total',
    ok: 'OK',
    redirected: 'Redirigidas',
    failed: 'Fallidas',
    blocked: 'Bloqueadas',
    inputUrl: 'URL de entrada',
    status: 'Estado',
    finalUrl: 'URL final',
    redirects: 'Redirecciones',
    error: 'Error',
    noRedirects: 'Sin redirecciones',
    hop: 'Salto',
  },
} as const

const parseUrls = (value: string): string[] =>
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

function UrlStatusCheckerPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [urlText, setUrlText] = useState('')
  const [result, setResult] = useState<InspectUrlsResponse | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const urls = useMemo(() => parseUrls(urlText), [urlText])

  const checkUrls = async () => {
    if (urls.length === 0) {
      setError(copy.emptyError)
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/url-status-checker/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      const payload = (await response.json()) as InspectUrlsResponse
      setResult(payload)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setResult(null)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section className="url-checker-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="url-panel">
        <header className="panel-head">
          <div>
            <h3>{copy.panelTitle}</h3>
            <p>{copy.panelDescription}</p>
          </div>
          <span className="url-count">
            {urls.length} {copy.queued}
          </span>
        </header>

        <textarea
          className="url-textarea"
          value={urlText}
          onChange={(event) => {
            setUrlText(event.target.value)
            setError(null)
            setResult(null)
          }}
          placeholder={copy.placeholder}
        />

        <div className="url-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={isChecking}
            onClick={() => {
              void checkUrls()
            }}
          >
            {isChecking ? copy.checking : copy.action}
          </button>
          <p>{copy.note}</p>
        </div>

        {error ? <p className="url-error">{error}</p> : null}
      </section>

      {result ? (
        <section className="url-results">
          <header className="results-head">
            <div>
              <h3>{copy.results}</h3>
              <p>
                {copy.inspected(result.summary.total)}
              </p>
            </div>
          </header>

          <div className="url-summary-grid">
            <div>
              <span>{copy.total}</span>
              <strong>{result.summary.total}</strong>
            </div>
            <div>
              <span>{copy.ok}</span>
              <strong>{result.summary.ok}</strong>
            </div>
            <div>
              <span>{copy.redirected}</span>
              <strong>{result.summary.redirected}</strong>
            </div>
            <div>
              <span>{copy.failed}</span>
              <strong>{result.summary.failed}</strong>
            </div>
            <div>
              <span>{copy.blocked}</span>
              <strong>{result.summary.blocked}</strong>
            </div>
          </div>

          <div className="url-table-wrap">
            <table className="url-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{copy.inputUrl}</th>
                  <th>{copy.status}</th>
                  <th>{copy.finalUrl}</th>
                  <th>{copy.redirects}</th>
                  <th>{copy.error}</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((item) => (
                  <tr key={`${item.index}-${item.inputUrl}`}>
                    <td>{item.index + 1}</td>
                    <td>{item.inputUrl}</td>
                    <td>
                      <span className={`status-chip ${item.ok ? 'is-ok' : 'is-failed'}`}>
                        {displayValue(item.statusCode)}
                      </span>
                    </td>
                    <td>{displayValue(item.finalUrl)}</td>
                    <td>
                      {item.redirects.length === 0 ? (
                        <span className="redirect-empty">{copy.noRedirects}</span>
                      ) : (
                        <ol className="redirect-list">
                          {item.redirects.map((redirect, redirectIndex) => (
                            <li key={`${redirect.from}-${redirect.to}-${redirectIndex}`}>
                              <strong>
                                {copy.hop} {redirectIndex + 1} · {redirect.statusCode}
                              </strong>
                              <span>{redirect.from}</span>
                              <span>{redirect.to}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </td>
                    <td>{displayValue(translateUrlError(item.error, language))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  )
}

export default UrlStatusCheckerPage
