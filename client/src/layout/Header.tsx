import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getToolName } from '../i18n/toolText'
import { tools } from '../registry/tools'
import { MenuIcon, ToolIcon } from '../ui/icons'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
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
          className="menu-btn"
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

      <label className="language-select" htmlFor="language-select">
        <span className="visually-hidden">{copy.language}</span>
        <select
          id="language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value === 'es' ? 'es' : 'en')}
          aria-label={copy.language}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </label>
    </header>
  )
}

export default Header
