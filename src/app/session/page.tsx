'use client'

import { useMemo, useState } from 'react'

import DailyGoal from '@/components/session/DailyGoal'
import PomodoroTimer from '@/components/session/PomodoroTimer'
import SessionLog, { type CompletedSession } from '@/components/session/SessionLog'

export default function SessionPage() {
  const [sessions, setSessions] = useState<CompletedSession[]>([])

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return sessions.filter((session) => session.timestamp.toISOString().slice(0, 10) === today)
      .length
  }, [sessions])

  function handleSessionComplete(duration: number) {
    setSessions((prev) => [
      ...prev,
      { duration, timestamp: new Date(), problemsSolved: 0 },
    ])
  }

  function handleSessionsSaved() {
    setSessions([])
  }

  return (
    <div className="max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-foreground">Study Session</h1>
        <p className="text-muted-foreground">Focus with Pomodoro technique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PomodoroTimer onSessionComplete={handleSessionComplete} />
        <DailyGoal completedToday={completedToday} />
      </div>

      <SessionLog sessions={sessions} onSessionsSaved={handleSessionsSaved} />
    </div>
  )
}
