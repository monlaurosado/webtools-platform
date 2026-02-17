import type { ToolIconKey } from '../ui/icons'

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: ToolIconKey;
}

export const tools: Tool[] = [
  {
    id: 'html-refactor',
    name: 'HTML Attribute Refactor',
    description: 'Extract and replace href/src attributes in HTML.',
    path: '/tools/html-refactor',
    icon: 'html-refactor',
  },
]
