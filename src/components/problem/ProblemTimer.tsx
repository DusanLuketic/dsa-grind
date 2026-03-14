'use client'

import { useHydrated, useTimer } from '@/hooks/useTimer'

interface ProblemTimerProps {
  problemId: number
}

export default function ProblemTimer({ problemId }: ProblemTimerProps) {
  const isHydrated = useHydrated()
  const { isRunning, formattedTime, start, pause, reset } = useTimer()

  if (!isHydrated) {
    return (
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Timer</span>
        <div className="h-8 w-24 animate-pulse rounded border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">Timer</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-2xl tabular-nums text-foreground">{formattedTime}</span>
        <div className="flex gap-1">
          {!isRunning ? (
            <button
              onClick={() => start(problemId)}
              className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
              type="button"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="rounded bg-muted px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80"
              type="button"
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="rounded border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
