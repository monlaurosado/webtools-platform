import HtmlInputPanel from './components/HtmlInputPanel'
import ReplacementList from './components/ReplacementList'
import ResultPanel from './components/ResultPanel'
import { useHtmlRefactor } from './hooks/useHtmlRefactor'
import './html-refactor.css'

function HtmlRefactorPage() {
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
        <p className="tool-eyebrow">HTML Attribute Refactor</p>
        <h2>Extrae y reemplaza enlaces de forma masiva</h2>
        <p>
          Compatible con atributos <code>href</code> y <code>src</code>. Puedes
          omitir enlaces individuales y aplicar solo los cambios que necesites.
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
          {isApplying ? 'Aplicando...' : 'Aplicar cambios'}
        </button>
        <p>Los enlaces omitidos o vacios se mantienen sin cambios.</p>
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
