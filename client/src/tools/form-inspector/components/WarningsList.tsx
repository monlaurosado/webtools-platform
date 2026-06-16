import { useLanguage } from '../../../i18n/LanguageContext'
import type { FormWarning } from '../types'
import { getFormWarningText } from '../warningText'

interface WarningsListProps {
  warnings: FormWarning[]
}

function WarningsList({ warnings }: WarningsListProps) {
  const { language } = useLanguage()

  if (warnings.length === 0) {
    return (
      <p className="warnings-empty">
        {language === 'es' ? 'No se detectaron avisos.' : 'No warnings detected.'}
      </p>
    )
  }

  return (
    <ul className="warnings-list">
      {warnings.map((warning, index) => (
        <li key={`${warning.code}-${warning.fieldIndex ?? 'form'}-${index}`}>
          <span className="warning-code">{warning.code}</span>
          <span>{getFormWarningText(warning.code, language, warning.message)}</span>
          {warning.fieldIndex != null ? (
            <span className="warning-field">
              {language === 'es' ? 'Campo' : 'Field'} #{warning.fieldIndex + 1}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default WarningsList
