import type { ToolIconKey } from '../ui/icons'

export interface Tool {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  path: string
  icon: ToolIconKey
  visible: boolean
}

export const tools: Tool[] = [
  {
    id: 'html-refactor',
    name: 'HTML Batch Replace',
    nameEs: 'Reemplazo masivo HTML',
    description: 'Replace href or src values across an HTML document.',
    descriptionEs: 'Sustituye valores href o src en todo un documento HTML.',
    path: '/',
    icon: 'html-refactor',
    visible: true,
  },
  {
    id: 'url-status-checker',
    name: 'Redirect Checker',
    nameEs: 'Comprobador de redirecciones',
    description: 'Check status codes, final URLs and every redirect hop.',
    descriptionEs: 'Comprueba estados, URL finales y cada salto de redirección.',
    path: '/tools/url-status-checker',
    icon: 'url-status-checker',
    visible: true,
  },
  {
    id: 'lead-csv-cleaner',
    name: 'CSV Cleaner',
    nameEs: 'Limpiador CSV',
    description: 'Normalize CSV rows and separate duplicates or invalid records.',
    descriptionEs: 'Normaliza filas CSV y separa duplicados o registros no válidos.',
    path: '/tools/lead-csv-cleaner',
    icon: 'lead-csv-cleaner',
    visible: true,
  },
  {
    id: 'csv-compare',
    name: 'CSV Compare',
    nameEs: 'Comparador CSV',
    description: 'Compare two CSV files by a key column.',
    descriptionEs: 'Compara dos archivos CSV mediante una columna clave.',
    path: '/tools/csv-compare',
    icon: 'csv-compare',
    visible: true,
  },
  {
    id: 'payload-inspector',
    name: 'JSON Inspector',
    nameEs: 'Inspector JSON',
    description: 'Explore JSON paths, types and sample values.',
    descriptionEs: 'Explora rutas, tipos y valores de ejemplo de un JSON.',
    path: '/tools/payload-inspector',
    icon: 'payload-inspector',
    visible: true,
  },
  {
    id: 'form-inspector',
    name: 'Form Inspector',
    nameEs: 'Inspector de formularios',
    description: 'Analyze fields, methods, actions and warnings in HTML forms.',
    descriptionEs: 'Analiza campos, métodos, acciones y avisos de formularios HTML.',
    path: '/tools/form-inspector',
    icon: 'form-inspector',
    visible: false,
  },
  {
    id: 'tracking-inspector',
    name: 'Tracking Inspector',
    nameEs: 'Inspector de seguimiento',
    description: 'Detect tracking scripts, providers and duplicates in HTML.',
    descriptionEs: 'Detecta scripts, proveedores y duplicados de seguimiento en HTML.',
    path: '/tools/tracking-inspector',
    icon: 'tracking-inspector',
    visible: false,
  },
  {
    id: 'campaign-preflight',
    name: 'Campaign Preflight',
    nameEs: 'Revisión previa de campaña',
    description: 'Run form, tracking and URL checks for a landing page.',
    descriptionEs: 'Revisa formularios, seguimiento y URLs de una página de destino.',
    path: '/tools/campaign-preflight',
    icon: 'campaign-preflight',
    visible: false,
  },
]

export const visibleTools = tools.filter((tool) => tool.visible)
