import type { HtmlAttribute } from '../types'

interface AttributeSelectorProps {
  value: HtmlAttribute
  onChange: (next: HtmlAttribute) => void
}

function AttributeSelector({ value, onChange }: AttributeSelectorProps) {
  return (
    <div className="attr-selector" role="group" aria-label="Attribute selector">
      <button
        type="button"
        className={`attr-option ${value === 'href' ? 'is-active' : ''}`}
        onClick={() => onChange('href')}
      >
        href
      </button>
      <button
        type="button"
        className={`attr-option ${value === 'src' ? 'is-active' : ''}`}
        onClick={() => onChange('src')}
      >
        src
      </button>
    </div>
  )
}

export default AttributeSelector
