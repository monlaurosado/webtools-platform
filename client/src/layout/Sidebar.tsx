import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getCategoryName, getToolCadence, getToolName } from '../i18n/toolText'
import { toolCategories, tools } from '../registry/tools'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  ToolIcon,
} from '../ui/icons'

interface SidebarProps {
  isOpen: boolean
  isDesktopCollapsed: boolean
  onClose: () => void
  onToggleDesktopCollapse: () => void
}

function Sidebar({
  isOpen,
  isDesktopCollapsed,
  onClose,
  onToggleDesktopCollapse,
}: SidebarProps) {
  const { language } = useLanguage()
  const copy = {
    subtitle:
      language === 'es'
        ? 'Consola para operaciones de marketing y control web'
        : 'Console for marketing ops and web QA',
    expandNavigation:
      language === 'es' ? 'Expandir navegación lateral' : 'Expand sidebar navigation',
    collapseNavigation:
      language === 'es' ? 'Contraer navegación lateral' : 'Collapse sidebar navigation',
    expandMenu: language === 'es' ? 'Expandir menú' : 'Expand menu',
    collapseMenu: language === 'es' ? 'Contraer menú' : 'Collapse menu',
    closeNavigation: language === 'es' ? 'Cerrar navegación' : 'Close navigation',
    mainNavigation: language === 'es' ? 'Navegación principal' : 'Main navigation',
    overview: language === 'es' ? 'Inicio' : 'Home',
    dashboard: language === 'es' ? 'Consola' : 'Console',
    dashboardCaption:
      language === 'es' ? 'Prioriza el flujo correcto' : 'Choose the right workflow',
    footerTitle: language === 'es' ? 'v0.1.0 privado' : 'v0.1.0 private',
    footer: language === 'es' ? 'Sin almacenamiento de proyectos' : 'No project storage',
  }

  const groupedTools = toolCategories
    .map((category) => ({
      category,
      tools: tools.filter((tool) => tool.category === category.id),
    }))
    .filter((group) => group.tools.length > 0)

  return (
    <>
      <aside
        className={`sidebar ${isOpen ? 'is-open' : ''} ${
          isDesktopCollapsed ? 'is-desktop-collapsed' : ''
        }`}
      >
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">WT</div>
          </div>

          <div className="title-mark">
            <h1 className="sidebar-title">WebTools Platform</h1>
            <p className="sidebar-subtitle">{copy.subtitle}</p>
          </div>

          <div className="sidebar-top-actions">
            <button
              className="desktop-collapse-btn"
              type="button"
              onClick={onToggleDesktopCollapse}
              aria-label={
                isDesktopCollapsed ? copy.expandNavigation : copy.collapseNavigation
              }
              title={isDesktopCollapsed ? copy.expandMenu : copy.collapseMenu}
            >
              {isDesktopCollapsed ? (
                <ChevronRightIcon className="control-icon" />
              ) : (
                <ChevronLeftIcon className="control-icon" />
              )}
            </button>
            <button
              className="mobile-close-btn"
              type="button"
              onClick={onClose}
              aria-label={copy.closeNavigation}
            >
              <CloseIcon className="control-icon" />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label={copy.mainNavigation}>
          <p className="sidebar-section-label">{copy.overview}</p>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'is-active' : ''}`
            }
            onClick={onClose}
            data-label={copy.dashboard}
            title={copy.dashboard}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              <DashboardIcon />
            </span>
            <span className="sidebar-link-copy">
              <span className="sidebar-link-title">{copy.dashboard}</span>
              <span className="sidebar-link-caption">{copy.dashboardCaption}</span>
            </span>
          </NavLink>

          {groupedTools.map(({ category, tools: categoryTools }) => (
            <div className="sidebar-category" key={category.id}>
              <p className="sidebar-section-label">{getCategoryName(category, language)}</p>
              {categoryTools.map((tool) => (
                <NavLink
                  key={tool.id}
                  to={tool.path}
                  className={({ isActive }) =>
                    `sidebar-link ${tool.priority === 'flagship' ? 'is-flagship' : ''} ${
                      isActive ? 'is-active' : ''
                    }`
                  }
                  onClick={onClose}
                  data-label={getToolName(tool, language)}
                  title={getToolName(tool, language)}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">
                    <ToolIcon toolIcon={tool.icon} />
                  </span>
                  <span className="sidebar-link-copy">
                    <span className="sidebar-link-title">{getToolName(tool, language)}</span>
                    <span className="sidebar-link-caption">
                      {getToolCadence(tool, language)}
                    </span>
                  </span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>{copy.footerTitle}</p>
          <p>{copy.footer}</p>
        </div>
      </aside>

      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        type="button"
        onClick={onClose}
        aria-label={copy.closeNavigation}
      />
    </>
  )
}

export default Sidebar
