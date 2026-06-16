import { useLanguage } from '../../../i18n/LanguageContext'
import type { InspectedForm } from '../types'

interface FormSummaryCardProps {
  form: InspectedForm
}

const displayValue = (value: string | null, language: 'en' | 'es') => {
  if (value == null) {
    return language === 'es' ? 'No definido' : 'Not defined'
  }

  if (value.trim().length === 0) {
    return language === 'es' ? '(vacío)' : '(empty)'
  }

  return value
}

function FormSummaryCard({ form }: FormSummaryCardProps) {
  const { language } = useLanguage()
  const metrics = [
    [language === 'es' ? 'Campos totales' : 'Total fields', form.summary.totalFields],
    [language === 'es' ? 'Campos input' : 'Inputs', form.summary.inputs],
    [language === 'es' ? 'Campos select' : 'Selects', form.summary.selects],
    [language === 'es' ? 'Áreas de texto' : 'Textareas', form.summary.textareas],
    [language === 'es' ? 'Botones' : 'Buttons', form.summary.buttons],
    [language === 'es' ? 'Ocultos' : 'Hidden', form.summary.hiddenFields],
    [language === 'es' ? 'Obligatorios' : 'Required', form.summary.requiredFields],
    [language === 'es' ? 'Avisos' : 'Warnings', form.warnings.length],
  ] as const

  return (
    <div className="form-summary-card">
      <div className="form-summary-main">
        <div>
          <p className="form-index">
            {language === 'es' ? 'Formulario' : 'Form'} #{form.index + 1}
          </p>
          <h3>{displayValue(form.action, language)}</h3>
        </div>
        <span className="method-pill">{displayValue(form.method, language)}</span>
      </div>

      <dl className="form-meta">
        <div>
          <dt>{language === 'es' ? 'Acción' : 'Action'}</dt>
          <dd>{displayValue(form.action, language)}</dd>
        </div>
        <div>
          <dt>{language === 'es' ? 'Método' : 'Method'}</dt>
          <dd>{displayValue(form.method, language)}</dd>
        </div>
      </dl>

      <div className="summary-metrics">
        {metrics.map(([label, value]) => (
          <div key={label} className="summary-metric">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FormSummaryCard
