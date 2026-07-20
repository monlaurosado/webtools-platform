import { useLanguage } from '../../i18n/LanguageContext'
import HtmlInputPanel from './components/HtmlInputPanel'
import ReplacementList from './components/ReplacementList'
import ResultPanel from './components/ResultPanel'
import { useHtmlRefactor } from './hooks/useHtmlRefactor'
import './html-refactor.css'

const COPY = {
  en: {
    title: 'Replace HTML links in bulk',
    description:
      'Paste your HTML, choose href or src, and replace every matching value in one pass.',
  },
  es: {
    title: 'Reemplaza enlaces HTML en lote',
    description:
      'Pega tu HTML, elige href o src y sustituye todos los valores necesarios de una vez.',
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
  const changeCount = replacementEntries.filter(
    (entry) => !entry.ignored && entry.replacement.trim().length > 0,
  ).length

  return (
    <section className="html-refactor-page">
      <header className="tool-header">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      <div className="html-workspace">
        <HtmlInputPanel
          html={html}
          attribute={attribute}
          isExtracting={isExtracting}
          extractError={extractError}
          onHtmlChange={setHtml}
          onAttributeChange={setAttribute}
          onFileChange={setHtmlFromFile}
          onClear={() => setHtml('')}
        />

        <ReplacementList
          entries={replacementEntries}
          attribute={attribute}
          hasHtml={html.trim().length > 0}
          isExtracting={isExtracting}
          isApplying={isApplying}
          canApply={changeCount > 0 && !isExtracting && !isApplying}
          changeCount={changeCount}
          onReplacementChange={setReplacement}
          onToggleIgnored={toggleIgnored}
          onApply={() => {
            void applyChanges()
          }}
        />
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
