import { useId, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import Header from './Header'
import Sidebar from './Sidebar'

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { language } = useLanguage()
  const sidebarId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <div className="webtools-root" lang={language}>
      <div className="app-shell">
        <Sidebar id={sidebarId} isOpen={isSidebarOpen} onClose={closeSidebar} />

        <div className="app-main">
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            sidebarId={sidebarId}
            isSidebarOpen={isSidebarOpen}
            menuButtonRef={menuButtonRef}
          />
          <main className="app-content">
            <h1 className="visually-hidden">WebTools Platform</h1>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
