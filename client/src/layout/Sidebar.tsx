import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getToolName } from '../i18n/toolText'
import { visibleTools } from '../registry/tools'
import { CloseIcon, ToolIcon } from '../ui/icons'

interface SidebarProps {
  id: string
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ id, isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isOpen) {
      sidebarRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    }
  }, [isOpen])
  const { language } = useLanguage()
  const copy = {
    tagline:
      language === 'es' ? 'Tareas repetitivas, resueltas.' : 'Repetitive tasks, solved.',
    tools: language === 'es' ? 'Herramientas' : 'Tools',
    closeNavigation: language === 'es' ? 'Cerrar navegación' : 'Close navigation',
    mainNavigation: language === 'es' ? 'Navegación principal' : 'Main navigation',
    privacy:
      language === 'es' ? 'Tus datos no se guardan.' : 'Your data is not stored.',
  }

  return (
    <>
      <aside
        id={id}
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'is-open' : ''}`}
        onKeyDown={(event) => {
          if (!isOpen) return
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
          if (event.key === 'Tab') {
            const controls = sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button')
            const first = controls?.[0]
            const last = controls?.[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first?.focus()
            }
          }
        }}
      >
        <div className="sidebar-top">
          <NavLink to="/" className="brand" onClick={onClose} aria-label="WebTools">
            <span className="brand-mark" aria-hidden="true">WT</span>
            <span className="brand-copy">
              <strong>WebTools</strong>
              <small>{copy.tagline}</small>
            </span>
          </NavLink>

          <button
            className="mobile-close-btn"
            type="button"
            onClick={onClose}
            aria-label={copy.closeNavigation}
          >
            <CloseIcon className="control-icon" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label={copy.mainNavigation}>
          <p className="sidebar-section-label">{copy.tools}</p>
          {visibleTools.map((tool) => (
            <NavLink
              key={tool.id}
              to={tool.path}
              end={tool.path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'is-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <ToolIcon toolIcon={tool.icon} />
              </span>
              <span>{getToolName(tool, language)}</span>
            </NavLink>
          ))}
        </nav>

        <p className="sidebar-footer">{copy.privacy}</p>
      </aside>

      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        type="button"
        onClick={onClose}
        tabIndex={-1}
        aria-hidden={!isOpen}
        aria-label={copy.closeNavigation}
      />
    </>
  )
}

export default Sidebar
