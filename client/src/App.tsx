import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { getToolDescription, getToolName } from './i18n/toolText'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import { tools } from './registry/tools'
import CampaignPreflightPage from './tools/campaign-preflight/CampaignPreflightPage'
import CsvComparePage from './tools/csv-compare/CsvComparePage'
import FormInspectorPage from './tools/form-inspector/FormInspectorPage'
import HtmlRefactorPage from './tools/html-refactor/HtmlRefactorPage'
import LeadCsvCleanerPage from './tools/lead-csv-cleaner/LeadCsvCleanerPage'
import PayloadInspectorPage from './tools/payload-inspector/PayloadInspectorPage'
import TrackingInspectorPage from './tools/tracking-inspector/TrackingInspectorPage'
import UrlStatusCheckerPage from './tools/url-status-checker/UrlStatusCheckerPage'

function ToolRoutePage() {
  const { toolId } = useParams()
  const { language } = useLanguage()
  const tool = tools.find((item) => item.id === toolId)

  if (!tool) {
    return (
      <section className="tool-placeholder">
        <h2>{language === 'es' ? 'Herramienta no encontrada' : 'Tool not found'}</h2>
        <p>
          {language === 'es'
            ? 'El módulo solicitado no está disponible actualmente en el registro.'
            : 'The requested module is not currently available in the registry.'}
        </p>
      </section>
    )
  }

  if (tool.id === 'html-refactor') {
    return <HtmlRefactorPage />
  }

  if (tool.id === 'form-inspector') {
    return <FormInspectorPage />
  }

  if (tool.id === 'lead-csv-cleaner') {
    return <LeadCsvCleanerPage />
  }

  if (tool.id === 'url-status-checker') {
    return <UrlStatusCheckerPage />
  }

  if (tool.id === 'payload-inspector') {
    return <PayloadInspectorPage />
  }

  if (tool.id === 'csv-compare') {
    return <CsvComparePage />
  }

  if (tool.id === 'tracking-inspector') {
    return <TrackingInspectorPage />
  }

  if (tool.id === 'campaign-preflight') {
    return <CampaignPreflightPage />
  }

  return (
    <section className="tool-placeholder">
      <p className="tool-placeholder-kicker">{language === 'es' ? 'Módulo' : 'Module'}</p>
      <h2>{getToolName(tool, language)}</h2>
      <p>{getToolDescription(tool, language)}</p>
      <p>
        {language === 'es'
          ? 'Esta vista está preparada y reservada para la implementación completa de la herramienta.'
          : 'This view is ready and reserved for the full tool implementation.'}
      </p>
    </section>
  )
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tools/:toolId" element={<ToolRoutePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
