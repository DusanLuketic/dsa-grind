'use client'

import { useState, useTransition } from 'react'
import { STATUS_LABELS } from '@/lib/constants'
import { updateProgress } from '@/lib/actions/progress'
import { showError } from '@/lib/toast'

interface StatusSelectorProps {
  problemId: number
  initialStatus: string
  onStatusChange?: (newStatus: string) => void
}

const STATUS_ICONS: Record<string, string> = {
  NOT_STARTED: '⭕',
  ATTEMPTED: '🔄',
  SOLVED: '✅',
  REVIEW: '🔁',
}

const STATUS_ORDER = ['NOT_STARTED', 'ATTEMPTED', 'SOLVED', 'REVIEW']

export default function StatusSelector({
  problemId,
  initialStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const [status, setStatus] = useState(initialStatus || 'NOT_STARTED')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: string) {
    const prevStatus = status
    setStatus(newStatus)
    setIsOpen(false)
    onStatusChange?.(newStatus)

    startTransition(async () => {
      try {
        await updateProgress(problemId, { status: newStatus })
      } catch {
        setStatus(prevStatus)
        onStatusChange?.(prevStatus)
        showError('Failed to update status')
      }
    })
  }

  const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status

  return (
    <div className="relative">
      <button
        data-status-selector
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border hover:border-primary/50 transition-colors text-sm disabled:opacity-50"
        aria-label={statusLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{STATUS_ICONS[status] ?? '⭕'}</span>
        <span className="text-foreground">{statusLabel}</span>
        <span className="text-muted-foreground ml-1">▼</span>
      </button>

      {isOpen && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute top-full left-0 mt-1 z-20 w-48 bg-card border border-border rounded-md shadow-lg overflow-hidden"
          >
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                role="menuitem"
                onClick={() => handleStatusChange(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                  status === s ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span>{STATUS_ICONS[s]}</span>
                <span>{STATUS_LABELS[s as keyof typeof STATUS_LABELS]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
