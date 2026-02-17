import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import { tools } from './registry/tools'
import HtmlRefactorPage from './tools/html-refactor/HtmlRefactorPage'

function ToolRoutePage() {
  const { toolId } = useParams()
  const tool = tools.find((item) => item.id === toolId)

  if (!tool) {
    return (
      <section className="tool-placeholder">
        <h2>Tool not found</h2>
        <p>The requested module is not currently available in the registry.</p>
      </section>
    )
  }

  if (tool.id === 'html-refactor') {
    return <HtmlRefactorPage />
  }

  return (
    <section className="tool-placeholder">
      <p className="tool-placeholder-kicker">Module</p>
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
      <p>This view is ready and reserved for the full tool implementation.</p>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tools/:toolId" element={<ToolRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
