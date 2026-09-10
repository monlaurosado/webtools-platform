import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import type { Language } from './i18n/LanguageContext'
import MainLayout from './layout/MainLayout'
import { RuntimeProvider } from './runtime/RuntimeContext'

const toolPages = {
  'html-refactor': lazy(() => import('./tools/html-refactor/HtmlRefactorPage')),
  'form-inspector': lazy(() => import('./tools/form-inspector/FormInspectorPage')),
  'lead-csv-cleaner': lazy(() => import('./tools/lead-csv-cleaner/LeadCsvCleanerPage')),
  'url-status-checker': lazy(() => import('./tools/url-status-checker/UrlStatusCheckerPage')),
  'payload-inspector': lazy(() => import('./tools/payload-inspector/PayloadInspectorPage')),
  'csv-compare': lazy(() => import('./tools/csv-compare/CsvComparePage')),
  'tracking-inspector': lazy(() => import('./tools/tracking-inspector/TrackingInspectorPage')),
  'campaign-preflight': lazy(() => import('./tools/campaign-preflight/CampaignPreflightPage')),
}

function ToolRoutePage({ defaultToolId }: { defaultToolId?: string }) {
  const { toolId = defaultToolId } = useParams()
  const { language } = useLanguage()
  const Page = toolId && Object.hasOwn(toolPages, toolId)
    ? toolPages[toolId as keyof typeof toolPages]
    : undefined

  if (!Page) {
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

  return (
    <Suspense fallback={<p role="status">{language === 'es' ? 'Cargando herramienta…' : 'Loading tool…'}</p>}>
      <Page key={toolId} />
    </Suspense>
  )
}

export interface AppProps {
  /** Public route at which the host mounts the complete application. */
  basename?: string
  /** API namespace including /api, without the /tools suffix. */
  apiBasePath?: string
  hostHref?: string
  initialLanguage?: Language
}

function App({ basename = '/', apiBasePath = '/api', hostHref, initialLanguage = 'en' }: AppProps) {
  return (
    <RuntimeProvider apiBasePath={apiBasePath} hostHref={hostHref}>
      <LanguageProvider initialLanguage={initialLanguage}>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<ToolRoutePage defaultToolId="html-refactor" />} />
              <Route path="/tools/html-refactor" element={<Navigate to="/" replace />} />
              <Route path="/tools/:toolId" element={<ToolRoutePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </RuntimeProvider>
  )
}

export default App
