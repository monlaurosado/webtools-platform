import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { tools } from '../registry/tools'
import { DashboardIcon, MenuIcon, SearchIcon, ToolIcon } from '../ui/icons'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)

  const searchItems = useMemo(
    () => [
      {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Vista principal de herramientas',
        path: '/',
        type: 'dashboard' as const,
      },
      ...tools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        path: tool.path,
        icon: tool.icon,
        type: 'tool' as const,
      })),
    ],
    [],
  )

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (query.length === 0) {
      return searchItems
    }

    return searchItems.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.id}`.toLowerCase()
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
        title: 'Dashboard',
        subtitle: 'Control center for your tool stack',
      }
    }

    const activeTool = tools.find((tool) => tool.path === pathname)

    if (activeTool) {
      return {
        title: activeTool.name,
        subtitle: activeTool.description,
      }
    }

    return {
      title: 'Workspace',
      subtitle: 'Modular utilities for web workflows',
    }
  }, [pathname])

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
          aria-label="Open navigation"
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
              placeholder="Buscar herramienta..."
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
            <div className="header-search-results" role="listbox" aria-label="Resultados de busqueda">
              {filteredItems.length === 0 ? (
                <p className="header-search-empty">Sin resultados</p>
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
                      <small>{item.description}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <span className="status-pill">Online</span>
      </div>
    </header>
  )
}

export default Header
