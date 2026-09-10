import { useId, useMemo } from 'react'
import type { RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getToolName } from '../i18n/toolText'
import { tools } from '../registry/tools'
import { useRuntime } from '../runtime/RuntimeContext'
import { MenuIcon, ToolIcon } from '../ui/icons'

interface HeaderProps {
  onMenuClick: () => void
  sidebarId: string
  isSidebarOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

function Header({ onMenuClick, sidebarId, isSidebarOpen, menuButtonRef }: HeaderProps) {
  const { hostHref } = useRuntime()
  const languageSelectId = useId()
  const { pathname } = useLocation()
  const { language, setLanguage } = useLanguage()
  const activeTool = useMemo(
    () => tools.find((tool) => tool.path === pathname) ?? tools[0],
    [pathname],
  )
  const copy = {
    openNavigation: language === 'es' ? 'Abrir navegación' : 'Open navigation',
    language: language === 'es' ? 'Idioma' : 'Language',
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          ref={menuButtonRef}
          className="menu-btn"
          aria-controls={sidebarId}
          aria-expanded={isSidebarOpen}
          type="button"
          onClick={onMenuClick}
          aria-label={copy.openNavigation}
        >
          <MenuIcon className="control-icon" />
        </button>

        <span className="header-tool-icon" aria-hidden="true">
          <ToolIcon toolIcon={activeTool.icon} />
        </span>
        <span className="header-title">{getToolName(activeTool, language)}</span>
      </div>

      <div className="header-actions">
        {hostHref ? (
          <a className="host-return" href={hostHref}>
            <span aria-hidden="true">← </span>
            {language === 'es' ? 'Volver a RosadoOS' : 'Back to RosadoOS'}
          </a>
        ) : null}
        <label className="language-select" htmlFor={languageSelectId}>
          <span className="visually-hidden">{copy.language}</span>
          <select
            id={languageSelectId}
            value={language}
            onChange={(event) => setLanguage(event.target.value === 'es' ? 'es' : 'en')}
            aria-label={copy.language}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>
      </div>
    </header>
  )
}

export default Header
