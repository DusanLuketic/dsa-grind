'use client'

import { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSession } from '@/lib/actions/sessions'
import { showError, showSuccess } from '@/lib/toast'

export interface CompletedSession {
  duration: number
  timestamp: Date
  problemsSolved: number
}

interface SessionLogProps {
  sessions: CompletedSession[]
  onSessionsSaved?: () => void
}

export default function SessionLog({ sessions, onSessionsSaved }: SessionLogProps) {
  const [problemsSolved, setProblemsSolved] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSaveSession() {
    if (sessions.length === 0) return

    setIsSaving(true)
    try {
      const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)
      await createSession({ duration: totalDuration, problemsSolved })
      setProblemsSolved(0)
      onSessionsSaved?.()
      showSuccess('Session saved!')
    } catch {
      showError('Failed to save session')
    } finally {
      setIsSaving(false)
    }
  }

  const totalMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.duration, 0),
    [sessions]
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Session Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete a Pomodoro session to log your progress
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, index) => (
              <div key={`${session.timestamp.toISOString()}-${session.duration}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Session {index + 1} - {session.timestamp.toLocaleTimeString()}
                </span>
                <span className="text-foreground">{session.duration} min</span>
              </div>
            ))}

            <div className="flex justify-between border-t border-border pt-2 text-sm font-medium">
              <span>Total</span>
              <span>{totalMinutes} min</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="session-problems-solved">
            Problems solved today:
          </label>
          <input
            id="session-problems-solved"
            type="number"
            min={0}
            value={problemsSolved}
            onChange={(e) => setProblemsSolved(Math.max(0, Number(e.target.value)))}
            className="w-16 rounded border border-border bg-transparent px-2 py-1 text-center text-sm text-foreground"
          />
        </div>

        <button
          onClick={handleSaveSession}
          disabled={sessions.length === 0 || isSaving}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          {isSaving ? 'Saving...' : 'Save Session'}
        </button>
      </CardContent>
    </Card>
  )
}
