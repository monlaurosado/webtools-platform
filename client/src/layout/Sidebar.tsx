import { NavLink } from 'react-router-dom'
import { tools } from '../registry/tools'
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
            <div>
              <h1 className="sidebar-title">WebTools Platform</h1>
              <p className="sidebar-subtitle">Professional utility workspace</p>
            </div>
          </div>

          <div className="sidebar-top-actions">
            <button
              className="desktop-collapse-btn"
              type="button"
              onClick={onToggleDesktopCollapse}
              aria-label={
                isDesktopCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'
              }
              title={isDesktopCollapsed ? 'Expand menu' : 'Collapse menu'}
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
              aria-label="Close navigation"
            >
              <CloseIcon className="control-icon" />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-section-label">Overview</p>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'is-active' : ''}`
            }
            onClick={onClose}
            data-label="Dashboard"
            title="Dashboard"
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              <DashboardIcon />
            </span>
            <span className="sidebar-link-copy">
              <span className="sidebar-link-title">Dashboard</span>
              <span className="sidebar-link-caption">Platform overview</span>
            </span>
          </NavLink>

          <p className="sidebar-section-label">Tools</p>
          {tools.map((tool) => (
            <NavLink
              key={tool.id}
              to={tool.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'is-active' : ''}`
              }
              onClick={onClose}
              data-label={tool.name}
              title={tool.name}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <ToolIcon toolIcon={tool.icon} />
              </span>
              <span className="sidebar-link-copy">
                <span className="sidebar-link-title">{tool.name}</span>
                <span className="sidebar-link-caption">{tool.id}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>v0.1.0</p>
          <p>Ready for new modules</p>
        </div>
      </aside>

      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
      />
    </>
  )
}

export default Sidebar
