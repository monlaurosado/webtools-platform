import type { ChangeEvent } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
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
  onClear: () => void
}

function HtmlInputPanel({
  html,
  attribute,
  isExtracting,
  extractError,
  onHtmlChange,
  onAttributeChange,
  onFileChange,
  onClear,
}: HtmlInputPanelProps) {
  const { language } = useLanguage()
  const copy = {
    title: language === 'es' ? 'HTML de origen' : 'Source HTML',
    description:
      language === 'es'
        ? 'Pega el código o abre un archivo .html.'
        : 'Paste the code or open an .html file.',
    upload: language === 'es' ? 'Abrir archivo' : 'Open file',
    uploadLabel: language === 'es' ? 'Abrir archivo HTML' : 'Open HTML file',
    clear: language === 'es' ? 'Vaciar' : 'Clear',
    attribute: language === 'es' ? 'Buscar atributo' : 'Find attribute',
    extracting: language === 'es' ? 'Detectando valores...' : 'Detecting values...',
    placeholder:
      language === 'es' ? 'Pega aquí tu HTML completo' : 'Paste your full HTML here',
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    onFileChange(file ?? null)
    event.target.value = ''
  }

  return (
    <section className="tool-panel">
      <header className="panel-head">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <div className="panel-head-actions">
          {html ? (
            <button type="button" className="text-btn" onClick={onClear}>
              {copy.clear}
            </button>
          ) : null}
          <label className="file-upload-btn">
            {copy.upload}
            <input
              type="file"
              accept=".html,text/html"
              onChange={handleFileInput}
              aria-label={copy.uploadLabel}
            />
          </label>
        </div>
      </header>

      <div className="panel-controls">
        <div>
          <p className="control-label">{copy.attribute}</p>
          <AttributeSelector value={attribute} onChange={onAttributeChange} />
        </div>
        {isExtracting ? <p className="extraction-status">{copy.extracting}</p> : null}
      </div>

      <textarea
        aria-label={copy.title}
        className="html-textarea"
        value={html}
        onChange={(event) => onHtmlChange(event.target.value)}
        placeholder={copy.placeholder}
      />

      {extractError ? <p role="alert" className="panel-error">{extractError}</p> : null}
    </section>
  )
}

export default HtmlInputPanel
