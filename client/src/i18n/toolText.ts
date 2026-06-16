import type { Language } from './LanguageContext'
import type { Tool, ToolCategory } from '../registry/tools'

export const getToolName = (tool: Tool, language: Language) =>
  language === 'es' ? tool.nameEs : tool.name

export const getToolDescription = (tool: Tool, language: Language) =>
  language === 'es' ? tool.descriptionEs : tool.description

export const getToolValue = (tool: Tool, language: Language) =>
  language === 'es' ? tool.valueEs : tool.value

export const getToolBestFor = (tool: Tool, language: Language) =>
  language === 'es' ? tool.bestForEs : tool.bestFor

export const getToolCadence = (tool: Tool, language: Language) =>
  language === 'es' ? tool.cadenceEs : tool.cadence

export const getCategoryName = (category: ToolCategory, language: Language) =>
  language === 'es' ? category.nameEs : category.name

export const getCategoryDescription = (category: ToolCategory, language: Language) =>
  language === 'es' ? category.descriptionEs : category.description
