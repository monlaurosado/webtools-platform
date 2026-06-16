import type { SVGProps } from 'react'

export type ToolIconKey =
  | 'html-refactor'
  | 'form-inspector'
  | 'csv-compare'
  | 'campaign-preflight'
  | 'lead-csv-cleaner'
  | 'payload-inspector'
  | 'tracking-inspector'
  | 'url-status-checker'

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

export function FormInspectorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h3.5" />
      <path d="M14.5 13h1.5" />
      <path d="M8 16h5" />
      <circle cx="16.5" cy="16" r="1" />
    </svg>
  )
}

export function LeadCsvCleanerIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 5.5h14" />
      <path d="M5 10h14" />
      <path d="M5 14.5h8" />
      <path d="M8.5 5.5v9" />
      <path d="M14.5 5.5v5" />
      <path d="M15 17l2 2 3.5-4" />
    </svg>
  )
}

export function UrlStatusCheckerIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 7.5h-1.5a4.5 4.5 0 0 0 0 9H10" />
      <path d="M14 7.5h1.5a4.5 4.5 0 0 1 0 9H14" />
      <path d="M9.5 12h5" />
      <path d="M16 5.5l2 2 3-3.2" />
    </svg>
  )
}

export function PayloadInspectorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8 5.5H6.5a2 2 0 0 0-2 2V9a2 2 0 0 1-1 1.7" />
      <path d="M3.5 13.3a2 2 0 0 1 1 1.7v1.5a2 2 0 0 0 2 2H8" />
      <path d="M16 5.5h1.5a2 2 0 0 1 2 2V9a2 2 0 0 0 1 1.7" />
      <path d="M20.5 13.3a2 2 0 0 0-1 1.7v1.5a2 2 0 0 1-2 2H16" />
      <path d="M10 9h4" />
      <path d="M9 12h6" />
      <path d="M10 15h4" />
    </svg>
  )
}

export function CsvCompareIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 6h6" />
      <path d="M5 10h6" />
      <path d="M5 14h4" />
      <path d="M13 8h6" />
      <path d="M13 12h6" />
      <path d="M15 16h4" />
      <path d="M10 18l2 2 2-2" />
      <path d="M12 4v16" />
    </svg>
  )
}

export function TrackingInspectorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="7.2" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 4.8v2.4" />
      <path d="M12 16.8v2.4" />
      <path d="M4.8 12h2.4" />
      <path d="M16.8 12h2.4" />
      <path d="M17.1 6.9l1.6-1.6" />
    </svg>
  )
}

export function CampaignPreflightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 18V6.5a1.5 1.5 0 0 1 1.5-1.5h8L19 9.5V18a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18Z" />
      <path d="M14 5v5h5" />
      <path d="M8 13h4" />
      <path d="M8 16h2.5" />
      <path d="M13.5 16l1.4 1.4 2.6-3" />
    </svg>
  )
}

export function ToolIcon({ toolIcon, ...props }: { toolIcon: ToolIconKey } & IconProps) {
  if (toolIcon === 'html-refactor') {
    return <HtmlRefactorIcon {...props} />
  }

  if (toolIcon === 'form-inspector') {
    return <FormInspectorIcon {...props} />
  }

  if (toolIcon === 'lead-csv-cleaner') {
    return <LeadCsvCleanerIcon {...props} />
  }

  if (toolIcon === 'url-status-checker') {
    return <UrlStatusCheckerIcon {...props} />
  }

  if (toolIcon === 'payload-inspector') {
    return <PayloadInspectorIcon {...props} />
  }

  if (toolIcon === 'csv-compare') {
    return <CsvCompareIcon {...props} />
  }

  if (toolIcon === 'tracking-inspector') {
    return <TrackingInspectorIcon {...props} />
  }

  if (toolIcon === 'campaign-preflight') {
    return <CampaignPreflightIcon {...props} />
  }

  return <HtmlRefactorIcon {...props} />
}
