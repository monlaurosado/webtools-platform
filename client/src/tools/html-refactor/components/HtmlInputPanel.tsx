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
  const { language } = useLanguage()
  const copy = {
    title: language === 'es' ? '1) Carga tu HTML' : '1) Load your HTML',
    description:
      language === 'es'
        ? 'Sube un archivo .html o pega el contenido manualmente.'
        : 'Upload an .html file or paste the content manually.',
    upload: language === 'es' ? 'Subir .html' : 'Upload .html',
    uploadLabel: language === 'es' ? 'Subir archivo HTML' : 'Upload HTML file',
    attribute: language === 'es' ? 'Atributo a detectar' : 'Attribute to detect',
    extracting: language === 'es' ? 'Detectando valores...' : 'Detecting values...',
    active:
      language === 'es' ? 'Detección automática activa' : 'Automatic detection active',
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
        <label className="file-upload-btn">
          {copy.upload}
          <input
            type="file"
            accept=".html,text/html"
            onChange={handleFileInput}
            aria-label={copy.uploadLabel}
          />
        </label>
      </header>

      <div className="panel-controls">
        <div>
          <p className="control-label">{copy.attribute}</p>
          <AttributeSelector value={attribute} onChange={onAttributeChange} />
        </div>
        <p className="extraction-status">
          {isExtracting ? copy.extracting : copy.active}
        </p>
      </div>

      <textarea
        className="html-textarea"
        value={html}
        onChange={(event) => onHtmlChange(event.target.value)}
        placeholder={copy.placeholder}
      />

      {extractError ? <p className="panel-error">{extractError}</p> : null}
    </section>
  )
}

export default HtmlInputPanel
