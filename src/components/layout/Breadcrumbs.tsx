'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

// Map route segments to display names
const SEGMENT_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'roadmap': 'Roadmap',
  'topic': 'Topics',
  'problem': 'Problems',
  'resources': 'Resources',
  'stats': 'Statistics',
  'session': 'Session',
}

function formatSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ??
    segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on root
  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-6 py-3 text-sm text-muted-foreground border-b border-border">
      <Link href="/" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const isLast = index === segments.length - 1
        const label = formatSegment(segment)

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
