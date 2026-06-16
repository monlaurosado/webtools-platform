import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import {
  getCategoryDescription,
  getCategoryName,
  getToolBestFor,
  getToolCadence,
  getToolDescription,
  getToolName,
  getToolValue,
} from '../i18n/toolText'
import { toolCategories, tools } from '../registry/tools'
import type { Tool, ToolPriority } from '../registry/tools'
import { ToolIcon } from '../ui/icons'

const DASHBOARD_COPY = {
  en: {
    eyebrow: 'WebTools Platform',
    title: 'Operations console for launch QA, lead data and web diagnostics',
    description:
      'A daily toolkit for marketing, CRO, web ops and lead-gen teams: inspect landings, tracking, forms, URLs, CSVs and payloads before issues reach production.',
    primaryAction: 'Run preflight',
    secondaryAction: 'Clean leads',
    stats: {
      tools: 'tools ready',
      storage: 'no project storage',
      flagship: 'flagship workflow',
    },
    statsLabel: 'Platform metrics',
    workflowsLabel: 'Fast workflows',
    workflows: [
      { label: 'Before traffic goes live', toolId: 'campaign-preflight' },
      { label: 'After a lead export', toolId: 'lead-csv-cleaner' },
      { label: 'When tracking changes', toolId: 'tracking-inspector' },
      { label: 'When mapping APIs', toolId: 'payload-inspector' },
    ],
    flagshipEyebrow: 'Flagship workflow',
    flagshipTitle: 'Start every launch with one consolidated QA pass',
    flagshipBody:
      'Campaign Preflight is the commercial anchor: it combines the highest-value checks into a single score that teams can run before sending paid traffic to a landing.',
    openFlagship: 'Open flagship',
    toolGroupsEyebrow: 'Tool stack',
    toolGroupsTitle: 'Organized by the work your users actually do',
    toolGroupsBody:
      'The portfolio keeps focused utilities, but the navigation now frames them as repeatable professional workflows.',
    openTool: 'Open',
    portfolioEyebrow: 'Portfolio audit',
    portfolioTitle: 'All tools stay, with clearer positioning',
    portfolioBody:
      'No app is removed. Each tool supports a real marketing operations, technical QA or data handoff job; the specialist utility is kept because it solves a narrow but high-friction task.',
    metrics: {
      retained: 'tools retained',
      daily: 'daily-use tools',
      specialist: 'specialist utility',
    },
    principles: [
      'Campaign Preflight becomes the premium entry point.',
      'Lead, URL and tracking tools support recurring operational work.',
      'HTML Attribute Refactor remains useful for bulk implementation fixes.',
    ],
    monetizationTitle: 'Monetization shape',
    monetizationBody:
      'The strongest paid path is usage limits, saved runs, exports and team-ready preflight reports, not removing core access from the current tool set.',
  },
  es: {
    eyebrow: 'WebTools Platform',
    title: 'Consola operativa para control de lanzamientos, leads y diagnóstico web',
    description:
      'Un conjunto de herramientas diario para equipos de marketing, optimización de conversión, operaciones web y generación de leads: revisa páginas de destino, seguimiento, formularios, URLs, CSVs y cargas JSON antes de que el error llegue a producción.',
    primaryAction: 'Ejecutar revisión',
    secondaryAction: 'Limpiar leads',
    stats: {
      tools: 'herramientas listas',
      storage: 'sin almacenamiento',
      flagship: 'flujo insignia',
    },
    statsLabel: 'Métricas de la plataforma',
    workflowsLabel: 'Flujos rápidos',
    workflows: [
      { label: 'Antes de activar tráfico', toolId: 'campaign-preflight' },
      { label: 'Después de exportar leads', toolId: 'lead-csv-cleaner' },
      { label: 'Cuando cambia el seguimiento', toolId: 'tracking-inspector' },
      { label: 'Cuando integras APIs', toolId: 'payload-inspector' },
    ],
    flagshipEyebrow: 'Flujo insignia',
    flagshipTitle: 'Empieza cada lanzamiento con un control consolidado',
    flagshipBody:
      'Revisión previa de campaña es el ancla comercial: combina las comprobaciones de mayor valor en una sola puntuación que el equipo puede ejecutar antes de enviar tráfico pagado a una página de destino.',
    openFlagship: 'Abrir flujo insignia',
    toolGroupsEyebrow: 'Conjunto de herramientas',
    toolGroupsTitle: 'Organizado por el trabajo real del usuario',
    toolGroupsBody:
      'La cartera mantiene utilidades enfocadas, pero ahora la navegación las presenta como flujos profesionales repetibles.',
    openTool: 'Abrir',
    portfolioEyebrow: 'Revisión de cartera',
    portfolioTitle: 'Todas las herramientas se conservan con mejor posicionamiento',
    portfolioBody:
      'No se elimina ninguna herramienta. Cada una resuelve un trabajo real de operaciones de marketing, control técnico o entrega de datos; la utilidad especialista se mantiene porque evita una tarea estrecha pero muy friccionada.',
    metrics: {
      retained: 'herramientas conservadas',
      daily: 'herramientas de uso diario',
      specialist: 'utilidad especialista',
    },
    principles: [
      'Revisión previa de campaña pasa a ser la entrada principal de pago.',
      'Leads, URLs y seguimiento sostienen trabajo operativo recurrente.',
      'Refactorización de atributos HTML sigue siendo útil para cambios masivos de implementación.',
    ],
    monetizationTitle: 'Forma de monetización',
    monetizationBody:
      'La ruta de pago más fuerte son límites de uso, ejecuciones guardadas, exportaciones e informes de lanzamiento para equipos, no quitar acceso base al conjunto actual.',
  },
} as const

const priorityLabels: Record<'en' | 'es', Record<ToolPriority, string>> = {
  en: {
    flagship: 'Flagship',
    daily: 'Daily',
    specialist: 'Specialist',
  },
  es: {
    flagship: 'Insignia',
    daily: 'Diaria',
    specialist: 'Especialista',
  },
}

const getToolById = (toolId: string) => tools.find((tool) => tool.id === toolId)

function Dashboard() {
  const { language } = useLanguage()
  const copy = DASHBOARD_COPY[language]
  const flagshipTool = tools.find((tool) => tool.priority === 'flagship') ?? tools[0]
  const leadCleaner = getToolById('lead-csv-cleaner') ?? tools[0]
  const dailyTools = tools.filter((tool) => tool.priority === 'daily')
  const specialistTools = tools.filter((tool) => tool.priority === 'specialist')
  const groupedTools = toolCategories
    .map((category) => ({
      category,
      tools: tools.filter((tool) => tool.category === category.id),
    }))
    .filter((group) => group.tools.length > 0)
  const workflowItems = copy.workflows.map((workflow) => ({
    ...workflow,
    tool: getToolById(workflow.toolId) ?? flagshipTool,
  }))

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">{copy.eyebrow}</p>
          <h2 id="dashboard-title">{copy.title}</h2>
          <p>{copy.description}</p>
          <div className="dashboard-actions">
            <Link className="primary-link" to={flagshipTool.path}>
              {copy.primaryAction}
            </Link>
            <Link className="secondary-link" to={leadCleaner.path}>
              {copy.secondaryAction}
            </Link>
          </div>
        </div>

        <dl className="dashboard-stats" aria-label={copy.statsLabel}>
          <div>
            <dt>{tools.length}</dt>
            <dd>{copy.stats.tools}</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>{copy.stats.storage}</dd>
          </div>
          <div>
            <dt>1</dt>
            <dd>{copy.stats.flagship}</dd>
          </div>
        </dl>
      </div>

      <section className="workflow-strip" aria-label={copy.workflowsLabel}>
        {workflowItems.map(({ label, tool }) => (
          <Link key={`${label}-${tool.id}`} className="workflow-link" to={tool.path}>
            <span>{label}</span>
            <strong>{getToolName(tool, language)}</strong>
            <small>{getToolValue(tool, language)}</small>
          </Link>
        ))}
      </section>

      <div className="dashboard-layout">
        <div className="dashboard-main-stack">
          <section className="flagship-panel" aria-labelledby="flagship-title">
            <div className="flagship-icon" aria-hidden="true">
              <ToolIcon toolIcon={flagshipTool.icon} />
            </div>
            <div className="flagship-body">
              <p className="section-eyebrow">{copy.flagshipEyebrow}</p>
              <h3 id="flagship-title">{copy.flagshipTitle}</h3>
              <p>{copy.flagshipBody}</p>
              <div className="flagship-meta" aria-label={getToolName(flagshipTool, language)}>
                <span>{getToolBestFor(flagshipTool, language)}</span>
                <span>{getToolCadence(flagshipTool, language)}</span>
                <span>{getToolDescription(flagshipTool, language)}</span>
              </div>
            </div>
            <Link className="primary-link compact" to={flagshipTool.path}>
              {copy.openFlagship}
            </Link>
          </section>

          <section className="tool-groups" aria-labelledby="tool-groups-title">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">{copy.toolGroupsEyebrow}</p>
                <h3 id="tool-groups-title">{copy.toolGroupsTitle}</h3>
              </div>
              <p>{copy.toolGroupsBody}</p>
            </div>

            {groupedTools.map(({ category, tools: categoryTools }) => (
              <article className="tool-group" key={category.id}>
                <header className="tool-group-head">
                  <div>
                    <h4>{getCategoryName(category, language)}</h4>
                    <p>{getCategoryDescription(category, language)}</p>
                  </div>
                  <span>{categoryTools.length}</span>
                </header>

                <div className="tool-row-list">
                  {categoryTools.map((tool: Tool) => (
                    <Link className="tool-row" key={tool.id} to={tool.path}>
                      <span className="tool-row-icon" aria-hidden="true">
                        <ToolIcon toolIcon={tool.icon} />
                      </span>
                      <span className="tool-row-main">
                        <strong>{getToolName(tool, language)}</strong>
                        <small>{getToolValue(tool, language)}</small>
                      </span>
                      <span className="tool-row-meta">
                        <span>{getToolBestFor(tool, language)}</span>
                        <span className={`priority-pill is-${tool.priority}`}>
                          {priorityLabels[language][tool.priority]}
                        </span>
                      </span>
                      <span className="tool-row-action">{copy.openTool}</span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>

        <aside className="dashboard-aside" aria-label={copy.portfolioTitle}>
          <section className="portfolio-panel">
            <p className="section-eyebrow">{copy.portfolioEyebrow}</p>
            <h3>{copy.portfolioTitle}</h3>
            <p>{copy.portfolioBody}</p>
            <div className="portfolio-metrics">
              <div>
                <strong>{tools.length}</strong>
                <span>{copy.metrics.retained}</span>
              </div>
              <div>
                <strong>{dailyTools.length}</strong>
                <span>{copy.metrics.daily}</span>
              </div>
              <div>
                <strong>{specialistTools.length}</strong>
                <span>{copy.metrics.specialist}</span>
              </div>
            </div>
            <ul className="portfolio-list">
              {copy.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </section>

          <section className="monetization-panel">
            <h3>{copy.monetizationTitle}</h3>
            <p>{copy.monetizationBody}</p>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default Dashboard
