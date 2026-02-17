import type { ChangeEvent } from 'react'
import type { HtmlAttribute } from '../types'
import AttributeSelector from './AttributeSelector'

interface HtmlInputPanelProps {
  html: string
  attribute: HtmlAttribute
  isExtracting: boolean
  extractError: string | null
  onHtmlChange: (value: string) => void
  onAttributeChange: (value: HtmlAttribute) => void
  onFileChange: (file: File | null) => void
}

function HtmlInputPanel({
  html,
  attribute,
  isExtracting,
  extractError,
  onHtmlChange,
  onAttributeChange,
  onFileChange,
}: HtmlInputPanelProps) {
  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    onFileChange(file ?? null)
    event.target.value = ''
  }

  return (
    <section className="tool-panel">
      <header className="panel-head">
        <div>
          <h3>1) Carga tu HTML</h3>
          <p>Sube un archivo .html o pega el contenido manualmente.</p>
        </div>
        <label className="file-upload-btn">
          Subir .html
          <input
            type="file"
            accept=".html,text/html"
            onChange={handleFileInput}
            aria-label="Subir archivo HTML"
          />
        </label>
      </header>

      <div className="panel-controls">
        <div>
          <p className="control-label">Atributo a detectar</p>
          <AttributeSelector value={attribute} onChange={onAttributeChange} />
        </div>
        <p className="extraction-status">
          {isExtracting ? 'Detectando valores...' : 'Deteccion automatica activa'}
        </p>
      </div>

      <textarea
        className="html-textarea"
        value={html}
        onChange={(event) => onHtmlChange(event.target.value)}
        placeholder="Pega aqui tu HTML completo"
      />

      {extractError ? <p className="panel-error">{extractError}</p> : null}
    </section>
  )
}

export default HtmlInputPanel
