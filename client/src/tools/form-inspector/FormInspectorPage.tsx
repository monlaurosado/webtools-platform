import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../i18n/messages'
import FieldsTable from './components/FieldsTable'
import FormSummaryCard from './components/FormSummaryCard'
import WarningsList from './components/WarningsList'
import type { AnalyzeFormsResponse, InspectedForm } from './types'
import './form-inspector.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const COPY = {
  en: {
    eyebrow: 'Form Inspector',
    title: 'Analyze HTML forms and field structure',
    description:
      'Paste HTML to extract forms, actions, methods, fields, labels and objective warnings without executing the submitted markup.',
    inputTitle: 'HTML input',
    inputDescription: 'Paste a page, component or landing snippet that contains forms.',
    limit: '1 MB max',
    emptyError: 'Paste HTML before analyzing forms.',
    requestError: 'Could not analyze forms.',
    analyzing: 'Analyzing...',
    action: 'Analyze forms',
    note: 'Detected HTML is analyzed as text and is never rendered in this view.',
    resultsTitle: 'Detected forms',
    runPrompt: 'Run an analysis to inspect form structure.',
    emptyResults: 'No forms were found in the provided HTML.',
    warnings: 'Warnings',
    fields: 'Fields',
    formFound: (count: number) => `${count} form${count === 1 ? '' : 's'} found`,
  },
  es: {
    eyebrow: 'Inspector de formularios',
    title: 'Analiza formularios HTML y estructura de campos',
    description:
      'Pega HTML para extraer formularios, acciones, métodos, campos, etiquetas y avisos objetivos sin ejecutar el marcado enviado.',
    inputTitle: 'Entrada HTML',
    inputDescription:
      'Pega una página, un componente o un fragmento de página de destino que contenga formularios.',
    limit: '1 MB máximo',
    emptyError: 'Pega HTML antes de analizar formularios.',
    requestError: 'No se pudieron analizar los formularios.',
    analyzing: 'Analizando...',
    action: 'Analizar formularios',
    note: 'El HTML detectado se analiza como texto y nunca se renderiza en esta vista.',
    resultsTitle: 'Formularios detectados',
    runPrompt: 'Ejecuta un análisis para inspeccionar la estructura del formulario.',
    emptyResults: 'No se encontraron formularios en el HTML proporcionado.',
    warnings: 'Avisos',
    fields: 'Campos',
    formFound: (count: number) =>
      `${count} ${count === 1 ? 'formulario encontrado' : 'formularios encontrados'}`,
  },
} as const

const normalizeForms = (forms: unknown): InspectedForm[] => {
  if (!Array.isArray(forms)) {
    return []
  }

  return forms as InspectedForm[]
}

function FormInspectorPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [html, setHtml] = useState('')
  const [forms, setForms] = useState<InspectedForm[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const analyzeForms = async () => {
    if (html.trim().length === 0) {
      setError(copy.emptyError)
      setForms([])
      setHasAnalyzed(false)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/form-inspector/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      })

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, language))
      }

      const payload = (await response.json()) as AnalyzeFormsResponse
      setForms(normalizeForms(payload.forms))
      setHasAnalyzed(true)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : copy.requestError
      setError(message)
      setForms([])
      setHasAnalyzed(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="form-inspector-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <section className="tool-panel">
        <header className="panel-head">
          <div>
            <h3>{copy.inputTitle}</h3>
            <p>{copy.inputDescription}</p>
          </div>
          <span className="input-limit">{copy.limit}</span>
        </header>

        <textarea
          className="form-html-textarea"
          value={html}
          onChange={(event) => {
            setHtml(event.target.value)
            setError(null)
          }}
          placeholder="<form action=&quot;/lead&quot; method=&quot;post&quot;>...</form>"
        />

        <div className="form-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              void analyzeForms()
            }}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? copy.analyzing : copy.action}
          </button>
          <p>{copy.note}</p>
        </div>

        {error ? <p className="panel-error">{error}</p> : null}
      </section>

      <section className="forms-results">
        <header className="results-head">
          <div>
            <h3>{copy.resultsTitle}</h3>
            <p>{hasAnalyzed ? copy.formFound(forms.length) : copy.runPrompt}</p>
          </div>
        </header>

        {hasAnalyzed && forms.length === 0 ? (
          <p className="empty-results">{copy.emptyResults}</p>
        ) : null}

        <div className="forms-list">
          {forms.map((form) => (
            <article key={form.index} className="inspected-form">
              <FormSummaryCard form={form} />

              <section className="form-detail-section">
                <h4>{copy.warnings}</h4>
                <WarningsList warnings={form.warnings} />
              </section>

              <section className="form-detail-section">
                <h4>{copy.fields}</h4>
                <FieldsTable fields={form.fields} />
              </section>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default FormInspectorPage
