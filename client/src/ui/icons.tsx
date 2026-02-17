import type { SVGProps } from 'react'

export type ToolIconKey = 'html-refactor'

type IconProps = SVGProps<SVGSVGElement>

const baseProps: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="6.8" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.3" />
      <rect x="13" y="3.5" width="7.5" height="5" rx="1.3" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.3" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.3" />
    </svg>
  )
}

export function HtmlRefactorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7.5 7.5L4 12l3.5 4.5" />
      <path d="M16.5 7.5L20 12l-3.5 4.5" />
      <path d="M11.2 18.5l1.6-13" />
      <path d="M8.4 5.5h7.2" />
      <path d="M8.8 18.5h6.4" />
    </svg>
  )
}

export function ToolIcon({ toolIcon, ...props }: { toolIcon: ToolIconKey } & IconProps) {
  if (toolIcon === 'html-refactor') {
    return <HtmlRefactorIcon {...props} />
  }

  return <HtmlRefactorIcon {...props} />
}
