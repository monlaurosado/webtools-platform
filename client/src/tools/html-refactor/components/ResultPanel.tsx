import { useLanguage } from '../../../i18n/LanguageContext'
import type { CopyState } from '../types'

interface ResultPanelProps {
  html: string
  copyState: CopyState
  onCopy: () => void
  onDownload: () => void
}

function ResultPanel({ html, copyState, onCopy, onDownload }: ResultPanelProps) {
  const { language } = useLanguage()
  const copy = {
    title: language === 'es' ? 'Resultado' : 'Result',
    description:
      language === 'es'
        ? 'El HTML modificado está listo para copiar o descargar.'
        : 'The updated HTML is ready to copy or download.',
    download: language === 'es' ? 'Descargar .html' : 'Download .html',
    copied: language === 'es' ? 'Copiado' : 'Copied',
    unavailable: language === 'es' ? 'No disponible' : 'Unavailable',
    copy: language === 'es' ? 'Copiar' : 'Copy',
  }

  return (
    <section className="tool-panel result-panel">
      <header className="panel-head">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <div className="panel-head-actions">
          <button type="button" className="secondary-btn" onClick={onCopy}>
            {copyState === 'copied'
              ? copy.copied
              : copyState === 'error'
                ? copy.unavailable
                : copy.copy}
          </button>
          <button type="button" className="secondary-btn" onClick={onDownload}>
            {copy.download}
          </button>
        </div>
      </header>

      <textarea aria-label={copy.title} className="result-textarea" value={html} readOnly />
    </section>
  )
}

export default ResultPanel
