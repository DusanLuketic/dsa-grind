'use client'

import { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DailyGoalState {
  goal: number
  completedToday: number
  date: string
}

interface DailyGoalProps {
  completedToday?: number
}

const STORAGE_KEY = 'dsa-grind-daily-goal'

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function initializeState(): DailyGoalState {
  if (typeof window === 'undefined') {
    return {
      goal: 5,
      completedToday: 0,
      date: getTodayStr(),
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return {
      goal: 5,
      completedToday: 0,
      date: getTodayStr(),
    }
  }

  try {
    const parsed = JSON.parse(stored) as DailyGoalState
    const today = getTodayStr()
    if (parsed.date === today) {
      return parsed
    }
    return { goal: parsed.goal, completedToday: 0, date: today }
  } catch {
    return {
      goal: 5,
      completedToday: 0,
      date: getTodayStr(),
    }
  }
}

export default function DailyGoal({ completedToday }: DailyGoalProps) {
  const [state, setState] = useState<DailyGoalState>(() => {
    const initial = initializeState()
    if (typeof completedToday === 'number') {
      return {
        ...initial,
        completedToday: Math.max(initial.completedToday, completedToday),
      }
    }
    return initial
  })

  function save(nextState: DailyGoalState) {
    setState(nextState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  }

  const progressPercent = useMemo(
    () => (state.goal > 0 ? (state.completedToday / state.goal) * 100 : 0),
    [state.completedToday, state.goal]
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily Goal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-foreground">{state.completedToday}</span>
          <span className="text-muted-foreground">/</span>
          <input
            type="number"
            min={1}
            max={50}
            value={state.goal}
            onChange={(e) =>
              save({
                ...state,
                goal: Math.max(1, Math.min(50, Number(e.target.value))),
              })
            }
            className="w-16 rounded border border-border bg-transparent px-2 py-1 text-center text-2xl font-bold text-foreground"
          />
          <span className="text-sm text-muted-foreground">problems today</span>
        </div>

        <Progress value={Math.max(0, Math.min(100, progressPercent))} className="h-2" />

        <div className="flex gap-2">
          <button
            onClick={() =>
              save({
                ...state,
                completedToday: Math.max(0, state.completedToday - 1),
              })
            }
            className="flex-1 rounded-md border border-border bg-card py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            type="button"
          >
            -1
          </button>
          <button
            onClick={() =>
              save({
                ...state,
                completedToday: state.completedToday + 1,
              })
            }
            className="flex-1 rounded-md bg-primary py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            type="button"
          >
            +1
          </button>
        </div>

        {state.completedToday >= state.goal && (
          <p className="text-center text-sm font-medium text-green-400">Daily goal reached!</p>
        )}
      </CardContent>
    </Card>
  )
}
