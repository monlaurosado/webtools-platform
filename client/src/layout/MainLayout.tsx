import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  showHeader?: boolean
}

function MainLayout({ showHeader = true }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false)

  const openSidebar = () => setIsSidebarOpen(true)
  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleDesktopSidebar = () =>
    setIsSidebarCollapsedDesktop((currentValue) => !currentValue)

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        isDesktopCollapsed={isSidebarCollapsedDesktop}
        onClose={closeSidebar}
        onToggleDesktopCollapse={toggleDesktopSidebar}
      />

      <div className="app-main">
        {showHeader ? <Header onMenuClick={openSidebar} /> : null}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
