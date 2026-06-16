import { useLanguage } from '../../i18n/LanguageContext'
import HtmlInputPanel from './components/HtmlInputPanel'
import ReplacementList from './components/ReplacementList'
import ResultPanel from './components/ResultPanel'
import { useHtmlRefactor } from './hooks/useHtmlRefactor'
import './html-refactor.css'

const COPY = {
  en: {
    eyebrow: 'HTML Attribute Refactor',
    title: 'Extract and replace links in bulk',
    descriptionStart: 'Supports',
    descriptionMiddle: 'and',
    descriptionEnd:
      'attributes. You can skip individual links and apply only the changes you need.',
    applying: 'Applying...',
    apply: 'Apply changes',
    note: 'Skipped or empty links stay unchanged.',
  },
  es: {
    eyebrow: 'Refactorización de atributos HTML',
    title: 'Extrae y reemplaza enlaces de forma masiva',
    descriptionStart: 'Compatible con atributos',
    descriptionMiddle: 'y',
    descriptionEnd:
      'Puedes omitir enlaces individuales y aplicar solo los cambios que necesites.',
    applying: 'Aplicando...',
    apply: 'Aplicar cambios',
    note: 'Los enlaces omitidos o vacíos se mantienen sin cambios.',
  },
} as const

function HtmlRefactorPage() {
  const { language } = useLanguage()
  const copy = COPY[language]
  const {
    html,
    attribute,
    isExtracting,
    isApplying,
    extractError,
    applyError,
    replacementEntries,
    resultHtml,
    copyState,
    setHtml,
    setAttribute,
    setHtmlFromFile,
    setReplacement,
    toggleIgnored,
    applyChanges,
    copyResult,
    downloadResult,
  } = useHtmlRefactor()

  return (
    <section className="html-refactor-page">
      <header className="tool-header">
        <p className="tool-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>
          {copy.descriptionStart} <code>href</code> {copy.descriptionMiddle}{' '}
          <code>src</code>
          {language === 'es' ? '. ' : ' '}
          {copy.descriptionEnd}
        </p>
      </header>

      <HtmlInputPanel
        html={html}
        attribute={attribute}
        isExtracting={isExtracting}
        extractError={extractError}
        onHtmlChange={setHtml}
        onAttributeChange={setAttribute}
        onFileChange={setHtmlFromFile}
      />

      <ReplacementList
        entries={replacementEntries}
        onReplacementChange={setReplacement}
        onToggleIgnored={toggleIgnored}
      />

      <div className="tool-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            void applyChanges()
          }}
          disabled={isApplying || isExtracting || html.trim().length === 0}
        >
          {isApplying ? copy.applying : copy.apply}
        </button>
        <p>{copy.note}</p>
      </div>

      {applyError ? <p className="tool-error">{applyError}</p> : null}

      {resultHtml ? (
        <ResultPanel
          html={resultHtml}
          copyState={copyState}
          onCopy={() => {
            void copyResult()
          }}
          onDownload={downloadResult}
        />
      ) : null}
    </section>
  )
}

export default HtmlRefactorPage
