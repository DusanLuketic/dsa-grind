'use client'

import { useEffect, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'

function padTime(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${padTime(minutes)}:${padTime(seconds)}`
}

export function useHydrated(): boolean {
  const [isHydrated] = useState(() => true)

  return isHydrated
}

export function useTimer() {
  const { timerState, startTimer, pauseTimer, resetTimer, getElapsed } = useAppStore()
  // Tick counter forces re-render every second while running
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!timerState.isRunning) return
    const intervalId = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(intervalId)
  }, [timerState.isRunning])

  // Derive elapsed directly from store state — no setState in effects
  // When running: calculate from startedAt timestamp (tick forces re-evaluation)
  // When stopped/paused/reset: use stored elapsed value
  // Note: `tick` is consumed here to trigger re-evaluation when interval fires
  const displayElapsed = timerState.isRunning ? getElapsed() : timerState.elapsed
  void tick

  return {
    isRunning: timerState.isRunning,
    elapsed: displayElapsed,
    formattedTime: formatElapsed(displayElapsed),
    problemId: timerState.problemId,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  }
}
