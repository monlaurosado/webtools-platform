import type { ToolIconKey } from '../ui/icons'

export type ToolCategoryId = 'launch-qa' | 'lead-ops' | 'technical-qa' | 'content-ops'
export type ToolPriority = 'flagship' | 'daily' | 'specialist'

export interface ToolCategory {
  id: ToolCategoryId
  name: string
  nameEs: string
  description: string
  descriptionEs: string
}

export interface Tool {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  value: string
  valueEs: string
  bestFor: string
  bestForEs: string
  cadence: string
  cadenceEs: string
  category: ToolCategoryId
  priority: ToolPriority
  path: string
  icon: ToolIconKey
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'launch-qa',
    name: 'Launch QA',
    nameEs: 'Control de lanzamientos',
    description: 'Checks that protect campaigns before traffic goes live.',
    descriptionEs: 'Comprobaciones que protegen campañas antes de activar tráfico.',
  },
  {
    id: 'lead-ops',
    name: 'Lead operations',
    nameEs: 'Operaciones de leads',
    description: 'CSV and data workflows for clean handoffs into CRM or reporting.',
    descriptionEs: 'Flujos CSV y de datos para entregas limpias a CRM o informes.',
  },
  {
    id: 'technical-qa',
    name: 'Technical QA',
    nameEs: 'Control técnico',
    description: 'Payload and implementation diagnostics for web and API teams.',
    descriptionEs: 'Diagnóstico de cargas e implementación para equipos web y API.',
  },
  {
    id: 'content-ops',
    name: 'Content operations',
    nameEs: 'Operaciones de contenido',
    description: 'Bulk fixes for HTML assets, landings and implementation snippets.',
    descriptionEs: 'Cambios masivos para HTML, páginas de destino y fragmentos de implementación.',
  },
]

export const tools: Tool[] = [
  {
    id: 'html-refactor',
    name: 'HTML Attribute Refactor',
    nameEs: 'Refactorización de atributos HTML',
    description: 'Extract and replace href/src attributes in HTML.',
    descriptionEs: 'Extrae y reemplaza atributos href/src en HTML.',
    value: 'Bulk-update links and assets without manual find/replace risk.',
    valueEs: 'Actualiza enlaces y recursos en lote sin riesgo de buscar y reemplazar a mano.',
    bestFor: 'HTML migrations',
    bestForEs: 'Migraciones HTML',
    cadence: 'Specialist utility',
    cadenceEs: 'Utilidad especialista',
    category: 'content-ops',
    priority: 'specialist',
    path: '/tools/html-refactor',
    icon: 'html-refactor',
  },
  {
    id: 'form-inspector',
    name: 'Form Inspector',
    nameEs: 'Inspector de formularios',
    description: 'Analyze HTML forms and extract fields, methods, actions and warnings.',
    descriptionEs: 'Analiza formularios HTML y extrae campos, métodos, acciones y avisos.',
    value: 'Catch missing actions, methods, names and submit paths before launch.',
    valueEs: 'Detecta acciones, métodos, nombres y envíos incompletos antes de lanzar.',
    bestFor: 'Lead forms',
    bestForEs: 'Formularios de leads',
    cadence: 'Every landing QA',
    cadenceEs: 'Cada revisión de página',
    category: 'launch-qa',
    priority: 'daily',
    path: '/tools/form-inspector',
    icon: 'form-inspector',
  },
  {
    id: 'lead-csv-cleaner',
    name: 'Lead CSV Cleaner',
    nameEs: 'Limpiador de leads CSV',
    description: 'Clean lead CSV exports, normalize emails and separate duplicate rows.',
    descriptionEs:
      'Limpia exportaciones CSV de leads, normaliza correos electrónicos y separa duplicados.',
    value: 'Prepare lead exports for CRM import without duplicate or empty-key noise.',
    valueEs: 'Prepara exportaciones de leads para CRM sin duplicados ni claves vacías.',
    bestFor: 'CRM handoff',
    bestForEs: 'Entrega a CRM',
    cadence: 'Daily data hygiene',
    cadenceEs: 'Higiene diaria de datos',
    category: 'lead-ops',
    priority: 'daily',
    path: '/tools/lead-csv-cleaner',
    icon: 'lead-csv-cleaner',
  },
  {
    id: 'url-status-checker',
    name: 'URL Status Checker',
    nameEs: 'Comprobador de estado de URLs',
    description: 'Check status codes, redirects and final URLs in safe batches.',
    descriptionEs: 'Comprueba estados, redirecciones y URL final en lotes seguros.',
    value: 'Expose broken URLs, redirect chains and final destinations before spend.',
    valueEs: 'Muestra URLs rotas, cadenas de redirección y destinos finales antes de invertir.',
    bestFor: 'URL QA',
    bestForEs: 'Revisión de URLs',
    cadence: 'Before paid traffic',
    cadenceEs: 'Antes de tráfico pagado',
    category: 'launch-qa',
    priority: 'daily',
    path: '/tools/url-status-checker',
    icon: 'url-status-checker',
  },
  {
    id: 'payload-inspector',
    name: 'Payload Inspector',
    nameEs: 'Inspector de cargas JSON',
    description: 'Inspect JSON payload paths, types, arrays and example values.',
    descriptionEs: 'Inspecciona rutas, tipos, arrays y ejemplos de cargas JSON.',
    value: 'Map webhook and API structures before writing mappings or automations.',
    valueEs: 'Mapea estructuras de webhooks y APIs antes de crear mapeos o automatizaciones.',
    bestFor: 'Webhook mapping',
    bestForEs: 'Mapeo de webhooks',
    cadence: 'Implementation QA',
    cadenceEs: 'Revisión de implementación',
    category: 'technical-qa',
    priority: 'daily',
    path: '/tools/payload-inspector',
    icon: 'payload-inspector',
  },
  {
    id: 'csv-compare',
    name: 'CSV Compare',
    nameEs: 'Comparador CSV',
    description: 'Compare two CSV exports by key and find differences.',
    descriptionEs: 'Compara dos exportaciones CSV por clave y encuentra diferencias.',
    value: 'Reconcile exports and spot changed, missing or duplicated records.',
    valueEs: 'Concilia exportaciones y detecta registros cambiados, ausentes o duplicados.',
    bestFor: 'Export reconciliation',
    bestForEs: 'Conciliación de exportaciones',
    cadence: 'Weekly or launch QA',
    cadenceEs: 'Semanal o revisión de lanzamiento',
    category: 'lead-ops',
    priority: 'daily',
    path: '/tools/csv-compare',
    icon: 'csv-compare',
  },
  {
    id: 'tracking-inspector',
    name: 'Tracking Inspector',
    nameEs: 'Inspector de seguimiento',
    description: 'Detect tracking pixels, scripts, providers and duplicates in HTML.',
    descriptionEs: 'Detecta píxeles, scripts, proveedores y duplicados en HTML.',
    value: 'Find missing or duplicated analytics tags before conversion data is lost.',
    valueEs: 'Detecta etiquetas analíticas ausentes o duplicadas antes de perder datos.',
    bestFor: 'Analytics QA',
    bestForEs: 'Revisión de analítica',
    cadence: 'Every tag change',
    cadenceEs: 'Cada cambio de etiquetas',
    category: 'launch-qa',
    priority: 'daily',
    path: '/tools/tracking-inspector',
    icon: 'tracking-inspector',
  },
  {
    id: 'campaign-preflight',
    name: 'Campaign Preflight',
    nameEs: 'Revisión previa de campaña',
    description: 'Run form, tracking and URL checks before launching a landing.',
    descriptionEs:
      'Ejecuta comprobaciones de formularios, seguimiento y URLs antes de lanzar una página de destino.',
    value: 'One consolidated launch score across forms, tracking and URLs.',
    valueEs: 'Una puntuación de lanzamiento que agrupa formularios, seguimiento y URLs.',
    bestFor: 'Campaign sign-off',
    bestForEs: 'Aprobación de campañas',
    cadence: 'Flagship workflow',
    cadenceEs: 'Flujo insignia',
    category: 'launch-qa',
    priority: 'flagship',
    path: '/tools/campaign-preflight',
    icon: 'campaign-preflight',
  },
]
