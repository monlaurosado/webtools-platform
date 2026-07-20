import { useLanguage } from '../../../i18n/LanguageContext'
import type { HtmlAttribute, ReplacementEntry } from '../types'

interface ReplacementListProps {
  entries: ReplacementEntry[]
  attribute: HtmlAttribute
  hasHtml: boolean
  isExtracting: boolean
  isApplying: boolean
  canApply: boolean
  changeCount: number
  onReplacementChange: (original: string, value: string) => void
  onToggleIgnored: (original: string) => void
  onApply: () => void
}

function ReplacementList({
  entries,
  attribute,
  hasHtml,
  isExtracting,
  isApplying,
  canApply,
  changeCount,
  onReplacementChange,
  onToggleIgnored,
  onApply,
}: ReplacementListProps) {
  const { language } = useLanguage()
  const copy = {
    title: language === 'es' ? 'Reemplazos' : 'Replacements',
    found: (count: number) =>
      language === 'es'
        ? `${count} ${count === 1 ? 'valor detectado' : 'valores detectados'}`
        : `${count} ${count === 1 ? 'value' : 'values'} found`,
    start:
      language === 'es'
        ? 'Pega o abre un HTML para empezar.'
        : 'Paste or open HTML to get started.',
    extracting: language === 'es' ? 'Buscando valores...' : 'Finding values...',
    noMatches: (value: HtmlAttribute) =>
      language === 'es'
        ? `No se encontraron atributos ${value}.`
        : `No ${value} attributes were found.`,
    original: language === 'es' ? 'Valor actual' : 'Current value',
    replaceWith: language === 'es' ? 'Nuevo valor' : 'New value',
    placeholder: language === 'es' ? 'Escribe el reemplazo' : 'Enter replacement',
    include: language === 'es' ? 'Incluir' : 'Include',
    skip: language === 'es' ? 'Omitir' : 'Skip',
    applying: language === 'es' ? 'Reemplazando...' : 'Replacing...',
    apply: language === 'es' ? 'Reemplazar' : 'Replace',
    pending: (count: number) =>
      language === 'es'
        ? `${count} ${count === 1 ? 'cambio listo' : 'cambios listos'}`
        : `${count} ${count === 1 ? 'change' : 'changes'} ready`,
    noChanges:
      language === 'es' ? 'Escribe al menos un nuevo valor.' : 'Enter at least one new value.',
  }

  let emptyMessage = copy.start
  if (isExtracting) {
    emptyMessage = copy.extracting
  } else if (hasHtml) {
    emptyMessage = copy.noMatches(attribute)
  }

  return (
    <section className="tool-panel replacement-panel">
      <header className="panel-head">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.found(entries.length)}</p>
        </div>
      </header>

      <div className="replacement-content" aria-live="polite">
        {entries.length === 0 ? (
          <p className="panel-empty">{emptyMessage}</p>
        ) : (
          <div className="replacement-list">
            {entries.map((entry, index) => (
              <div
                key={entry.original}
                className={`replacement-row ${entry.ignored ? 'is-ignored' : ''}`}
              >
                <div className="row-original">
                  <span>{copy.original}</span>
                  <code>{entry.original}</code>
                </div>

                <label className="row-target" htmlFor={`replace-value-${index}`}>
                  <span>{copy.replaceWith}</span>
                  <input
                    id={`replace-value-${index}`}
                    type="text"
                    value={entry.replacement}
                    onChange={(event) =>
                      onReplacementChange(entry.original, event.target.value)
                    }
                    disabled={entry.ignored}
                    placeholder={copy.placeholder}
                  />
                </label>

                <button
                  type="button"
                  className={`omit-btn ${entry.ignored ? 'is-active' : ''}`}
                  onClick={() => onToggleIgnored(entry.original)}
                >
                  {entry.ignored ? copy.include : copy.skip}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="replacement-footer">
        <button type="button" className="primary-btn" onClick={onApply} disabled={!canApply}>
          {isApplying ? copy.applying : copy.apply}
        </button>
        <p>{changeCount > 0 ? copy.pending(changeCount) : copy.noChanges}</p>
      </footer>
    </section>
  )
}

export default ReplacementList
