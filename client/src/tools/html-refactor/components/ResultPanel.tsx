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
    title: language === 'es' ? '3) Resultado' : '3) Result',
    description:
      language === 'es'
        ? 'Descarga, copia y valida el HTML final antes de usarlo.'
        : 'Download, copy and validate the final HTML before using it.',
    download: language === 'es' ? 'Descargar .html' : 'Download .html',
    copied: language === 'es' ? 'Copiado' : 'Copied',
    unavailable: language === 'es' ? 'No disponible' : 'Unavailable',
    copy: language === 'es' ? 'Copiar' : 'Copy',
    preview: language === 'es' ? 'Vista previa' : 'Preview',
    previewTitle:
      language === 'es' ? 'Vista previa del resultado HTML' : 'HTML result preview',
  }

  return (
    <section className="tool-panel result-panel">
      <header className="panel-head">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>

        <button type="button" className="secondary-btn download-btn" onClick={onDownload}>
          {copy.download}
        </button>
      </header>

      <div className="result-editor">
        <textarea className="result-textarea" value={html} readOnly />
        <button type="button" className="secondary-btn copy-btn" onClick={onCopy}>
          {copyState === 'copied'
            ? copy.copied
            : copyState === 'error'
              ? copy.unavailable
              : copy.copy}
        </button>
      </div>

      <div className="result-preview">
        <p>{copy.preview}</p>
        <iframe title={copy.previewTitle} srcDoc={html} sandbox="" />
      </div>
    </section>
  )
}

export default ResultPanel
