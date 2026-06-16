import { useLanguage } from '../../../i18n/LanguageContext'
import type { ReplacementEntry } from '../types'

interface ReplacementListProps {
  entries: ReplacementEntry[]
  onReplacementChange: (original: string, value: string) => void
  onToggleIgnored: (original: string) => void
}

function ReplacementList({
  entries,
  onReplacementChange,
  onToggleIgnored,
}: ReplacementListProps) {
  const { language } = useLanguage()
  const copy = {
    title: language === 'es' ? '2) Define reemplazos' : '2) Define replacements',
    description:
      language === 'es'
        ? 'Para cada enlace detectado, define un nuevo valor o usa "Omitir" para mantener el original.'
        : 'For each detected link, define a new value or use "Skip" to keep the original.',
    empty:
      language === 'es'
        ? 'Todavía no se detectaron enlaces para el atributo seleccionado.'
        : 'No links have been detected for the selected attribute yet.',
    original: language === 'es' ? 'Original' : 'Original',
    replaceWith: language === 'es' ? 'Reemplazar por' : 'Replace with',
    placeholder: language === 'es' ? 'Nuevo enlace' : 'New link',
    include: language === 'es' ? 'Incluir' : 'Include',
    skip: language === 'es' ? 'Omitir' : 'Skip',
  }

  return (
    <section className="tool-panel">
      <header className="panel-head">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="panel-empty">{copy.empty}</p>
      ) : (
        <div className="replacement-list">
          {entries.map((entry, index) => (
            <article
              key={entry.original}
              className={`replacement-row ${entry.ignored ? 'is-ignored' : ''}`}
            >
              <div className="row-original">
                <p>{copy.original}</p>
                <code>{entry.original}</code>
              </div>

              <div className="row-target">
                <label htmlFor={`replace-value-${index}`}>{copy.replaceWith}</label>
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
              </div>

              <button
                type="button"
                className={`omit-btn ${entry.ignored ? 'is-active' : ''}`}
                onClick={() => onToggleIgnored(entry.original)}
              >
                {entry.ignored ? copy.include : copy.skip}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ReplacementList
