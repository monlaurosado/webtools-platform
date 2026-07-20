import type { Language } from './LanguageContext'
import type { Tool } from '../registry/tools'

export const getToolName = (tool: Tool, language: Language) =>
  language === 'es' ? tool.nameEs : tool.name

export const getToolDescription = (tool: Tool, language: Language) =>
  language === 'es' ? tool.descriptionEs : tool.description
