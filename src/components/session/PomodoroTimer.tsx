'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

import { useAudioNotification } from './useAudioNotification'

type TimerMode = 'work' | 'break' | 'longBreak'

interface PomodoroTimerProps {
  onSessionComplete?: (duration: number) => void
}

function padTime(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const { pomodoroState, setPomodoroState, pomodoroComplete } = useAppStore()
  const { mode, isRunning, endTime, remainingMs, completedSessions, durations } = pomodoroState

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onSessionCompleteRef = useRef(onSessionComplete)
  onSessionCompleteRef.current = onSessionComplete

  const { playBeep, requestPermission } = useAudioNotification()

  const handleTimerComplete = useCallback(() => {
    playBeep()
    const { mode: currentMode, durations: currentDurations } =
      useAppStore.getState().pomodoroState
    pomodoroComplete()
    if (currentMode === 'work') {
      onSessionCompleteRef.current?.(currentDurations.work)
    }
  }, [pomodoroComplete, playBeep])

  // Recovery: handle timer that completed while component was unmounted
  const recoveredRef = useRef(false)
  useEffect(() => {
    if (recoveredRef.current) return
    recoveredRef.current = true

    const state = useAppStore.getState().pomodoroState
    if (state.isRunning && state.endTime !== null && state.endTime <= Date.now()) {
      handleTimerComplete()
    }
  }, [handleTimerComplete])

  useEffect(() => {
    if (!isRunning || endTime === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const remaining = endTime - Date.now()

      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setPomodoroState({ isRunning: false, remainingMs: 0 })
        handleTimerComplete()
        return
      }

      setPomodoroState({ remainingMs: remaining })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [endTime, handleTimerComplete, isRunning, setPomodoroState])

  function start() {
    void requestPermission()
    setPomodoroState({ endTime: Date.now() + remainingMs, isRunning: true })
  }

  function pause() {
    if (endTime !== null) {
      setPomodoroState({
        remainingMs: Math.max(0, endTime - Date.now()),
        isRunning: false,
        endTime: null,
      })
    } else {
      setPomodoroState({ isRunning: false, endTime: null })
    }
  }

  function reset() {
    setPomodoroState({
      isRunning: false,
      endTime: null,
      remainingMs: durations[mode] * 60 * 1000,
    })
  }

  function skip() {
    pause()
    handleTimerComplete()
  }

  const totalMs = durations[mode] * 60 * 1000
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const progressPercent = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0

  const modeLabels = useMemo<Record<TimerMode, string>>(
    () => ({
      work: 'Focus Time',
      break: 'Short Break',
      longBreak: 'Long Break',
    }),
    []
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{modeLabels[mode]}</CardTitle>
        <p className="text-xs text-muted-foreground">Session #{completedSessions + 1}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="py-4 text-center">
          <div className="tabular-nums text-6xl font-bold font-mono text-foreground">
            {padTime(minutes)}:{padTime(seconds)}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <button
              onClick={start}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              type="button"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="rounded-md bg-muted px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
              type="button"
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            type="button"
          >
            Reset
          </button>
          <button
            onClick={skip}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            type="button"
          >
            Skip
          </button>
        </div>

        <div className="flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {(['work', 'break', 'longBreak'] as TimerMode[]).map((durationMode) => (
            <label key={durationMode} className="flex items-center gap-1">
              <span className="capitalize">
                {durationMode === 'longBreak' ? 'Long' : durationMode}:
              </span>
              <input
                type="number"
                min={1}
                max={60}
                value={durations[durationMode]}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(60, Number(e.target.value)))
                  const newDurations = { ...durations, [durationMode]: value } as Record<
                    TimerMode,
                    number
                  >
                  if (!isRunning && mode === durationMode) {
                    setPomodoroState({ durations: newDurations, remainingMs: value * 60 * 1000 })
                  } else {
                    setPomodoroState({ durations: newDurations })
                  }
                }}
                className="w-10 rounded border border-border bg-transparent px-1 py-0.5 text-center text-foreground"
              />
              <span>min</span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
