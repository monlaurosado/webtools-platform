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
  return (
    <section className="tool-panel">
      <header className="panel-head">
        <div>
          <h3>2) Define reemplazos</h3>
          <p>
            Para cada enlace detectado, define un nuevo valor o usa "Omitir" para
            mantener el original.
          </p>
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="panel-empty">
          Todavia no se detectaron enlaces para el atributo seleccionado.
        </p>
      ) : (
        <div className="replacement-list">
          {entries.map((entry, index) => (
            <article
              key={entry.original}
              className={`replacement-row ${entry.ignored ? 'is-ignored' : ''}`}
            >
              <div className="row-original">
                <p>Original</p>
                <code>{entry.original}</code>
              </div>

              <div className="row-target">
                <label htmlFor={`replace-value-${index}`}>Reemplazar por</label>
                <input
                  id={`replace-value-${index}`}
                  type="text"
                  value={entry.replacement}
                  onChange={(event) =>
                    onReplacementChange(entry.original, event.target.value)
                  }
                  disabled={entry.ignored}
                  placeholder="Nuevo enlace"
                />
              </div>

              <button
                type="button"
                className={`omit-btn ${entry.ignored ? 'is-active' : ''}`}
                onClick={() => onToggleIgnored(entry.original)}
              >
                {entry.ignored ? 'Incluir' : 'Omitir'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ReplacementList
