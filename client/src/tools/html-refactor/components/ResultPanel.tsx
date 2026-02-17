import type { CopyState } from '../types'

interface ResultPanelProps {
  html: string
  copyState: CopyState
  onCopy: () => void
  onDownload: () => void
}

function ResultPanel({ html, copyState, onCopy, onDownload }: ResultPanelProps) {
  return (
    <section className="tool-panel result-panel">
      <header className="panel-head">
        <div>
          <h3>3) Resultado</h3>
          <p>Descarga, copia y valida el HTML final antes de usarlo.</p>
        </div>

        <button type="button" className="secondary-btn download-btn" onClick={onDownload}>
          Descargar .html
        </button>
      </header>

      <div className="result-editor">
        <textarea className="result-textarea" value={html} readOnly />
        <button type="button" className="secondary-btn copy-btn" onClick={onCopy}>
          {copyState === 'copied' ? 'Copiado' : copyState === 'error' ? 'No disponible' : 'Copiar'}
        </button>
      </div>

      <div className="result-preview">
        <p>Preview</p>
        <iframe title="HTML result preview" srcDoc={html} sandbox="" />
      </div>
    </section>
  )
}

export default ResultPanel
