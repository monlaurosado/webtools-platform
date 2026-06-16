import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import {
  getCategoryName,
  getToolBestFor,
  getToolCadence,
  getToolDescription,
  getToolName,
  getToolValue,
} from '../i18n/toolText'
import { toolCategories, tools } from '../registry/tools'
import { DashboardIcon, MenuIcon, SearchIcon, ToolIcon } from '../ui/icons'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const copy = {
    dashboard: language === 'es' ? 'Consola operativa' : 'Operations console',
    dashboardDescription:
      language === 'es'
        ? 'Lanzamientos, leads, seguimiento y control técnico'
        : 'Launches, leads, tracking and technical QA',
    workspace: language === 'es' ? 'Espacio de trabajo' : 'Workspace',
    workspaceDescription:
      language === 'es'
        ? 'Utilidades modulares para flujos web'
        : 'Modular utilities for web workflows',
    openNavigation: language === 'es' ? 'Abrir navegación' : 'Open navigation',
    searchPlaceholder:
      language === 'es'
        ? 'Buscar por herramienta o tarea...'
        : 'Search by tool or job...',
    searchResults: language === 'es' ? 'Resultados de búsqueda' : 'Search results',
    noResults: language === 'es' ? 'Sin resultados' : 'No results',
    language: language === 'es' ? 'Idioma' : 'Language',
    privacy: language === 'es' ? 'Sin almacenamiento' : 'No storage',
    dashboardMeta: language === 'es' ? 'Cartera y flujos rápidos' : 'Portfolio and fast workflows',
  }

  const searchItems = useMemo(
    () => [
      {
        id: 'dashboard',
        name: copy.dashboard,
        description: copy.dashboardDescription,
        meta: copy.dashboardMeta,
        path: '/',
        type: 'dashboard' as const,
      },
      ...tools.map((tool) => {
        const category = toolCategories.find((item) => item.id === tool.category)
        const categoryName = category ? getCategoryName(category, language) : ''
        const bestFor = getToolBestFor(tool, language)
        const cadence = getToolCadence(tool, language)
        const value = getToolValue(tool, language)

        return {
          id: tool.id,
          name: getToolName(tool, language),
          description: getToolDescription(tool, language),
          meta: [categoryName, bestFor].filter(Boolean).join(' / '),
          path: tool.path,
          icon: tool.icon,
          type: 'tool' as const,
          haystack: [tool.id, categoryName, bestFor, cadence, value].join(' '),
        }
      }),
    ],
    [language],
  )

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (query.length === 0) {
      return searchItems
    }

    return searchItems.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.meta} ${
        'haystack' in item ? item.haystack : item.id
      }`.toLowerCase()
      return haystack.includes(query)
    })
  }, [searchItems, searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchWrapRef.current) {
        return
      }

      if (!searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const headerData = useMemo(() => {
    if (pathname === '/') {
      return {
        title: copy.dashboard,
        subtitle: copy.dashboardDescription,
      }
    }

    const activeTool = tools.find((tool) => tool.path === pathname)

    if (activeTool) {
      return {
        title: getToolName(activeTool, language),
        subtitle: getToolValue(activeTool, language),
      }
    }

    return {
      title: copy.workspace,
      subtitle: copy.workspaceDescription,
    }
  }, [language, pathname])

  const goToPath = (path: string) => {
    navigate(path)
    setSearchQuery('')
    setIsSearchOpen(false)
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

        <div className="header-copy">
          <p className="header-kicker">WebTools Platform</p>
          <h2 className="header-title">{headerData.title}</h2>
          <p className="header-subtitle">{headerData.subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="header-search-wrap" ref={searchWrapRef}>
          <label className="header-search" htmlFor="tool-search">
            <SearchIcon className="header-search-icon" />
            <input
              id="tool-search"
              name="tool-search"
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const [firstResult] = filteredItems
                  if (firstResult) {
                    goToPath(firstResult.path)
                  }
                }
              }}
            />
          </label>

          {isSearchOpen ? (
            <div
              className="header-search-results"
              role="listbox"
              aria-label={copy.searchResults}
            >
              {filteredItems.length === 0 ? (
                <p className="header-search-empty">{copy.noResults}</p>
              ) : (
                filteredItems.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="header-search-item"
                    onClick={() => goToPath(item.path)}
                  >
                    <span className="header-search-item-icon" aria-hidden="true">
                      {item.type === 'dashboard' ? (
                        <DashboardIcon />
                      ) : (
                        <ToolIcon toolIcon={item.icon} />
                      )}
                    </span>
                    <span className="header-search-item-copy">
                      <strong>{item.name}</strong>
                      <small>{item.meta || item.description}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <label className="language-select" htmlFor="language-select">
          <span>{copy.language}</span>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value === 'es' ? 'es' : 'en')}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </label>
        <span className="status-pill">{copy.privacy}</span>
      </div>
    </header>
  )
}

export default Header
