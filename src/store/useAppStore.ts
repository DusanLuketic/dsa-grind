'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface TimerState {
  isRunning: boolean
  startedAt: number | null
  elapsed: number
  problemId: number | null
}

type PomodoroMode = 'work' | 'break' | 'longBreak'

interface PomodoroState {
  durations: Record<PomodoroMode, number>
  mode: PomodoroMode
  isRunning: boolean
  endTime: number | null
  remainingMs: number
  completedSessions: number
}

interface AppStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  timerState: TimerState
  startTimer: (problemId: number) => void
  pauseTimer: () => void
  resetTimer: () => void
  getElapsed: () => number
  pomodoroState: PomodoroState
  setPomodoroState: (update: Partial<PomodoroState>) => void
  pomodoroComplete: () => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      timerState: {
        isRunning: false,
        startedAt: null,
        elapsed: 0,
        problemId: null,
      },
      startTimer: (problemId) =>
        set((state) => ({
          timerState: {
            ...state.timerState,
            isRunning: true,
            startedAt: Date.now(),
            problemId,
          },
        })),
      pauseTimer: () =>
        set((state) => {
          const { timerState } = state

          if (!timerState.isRunning || timerState.startedAt === null) {
            return state
          }

          return {
            timerState: {
              ...timerState,
              isRunning: false,
              startedAt: null,
              elapsed: timerState.elapsed + (Date.now() - timerState.startedAt),
            },
          }
        }),
      resetTimer: () =>
        set((state) => ({
          timerState: {
            ...state.timerState,
            isRunning: false,
            startedAt: null,
            elapsed: 0,
          },
        })),
      getElapsed: () => {
        const { timerState } = get()

        if (timerState.isRunning && timerState.startedAt !== null) {
          return timerState.elapsed + (Date.now() - timerState.startedAt)
        }

        return timerState.elapsed
      },
      pomodoroState: {
        durations: { work: 25, break: 5, longBreak: 15 },
        mode: 'work' as PomodoroMode,
        isRunning: false,
        endTime: null,
        remainingMs: 25 * 60 * 1000,
        completedSessions: 0,
      },
      setPomodoroState: (update) =>
        set((state) => ({
          pomodoroState: { ...state.pomodoroState, ...update },
        })),
      pomodoroComplete: () => {
        const ps = get().pomodoroState
        const newCount = ps.completedSessions + 1
        let newMode: PomodoroMode
        let newRemainingMs: number

        if (ps.mode === 'work') {
          if (newCount % 4 === 0) {
            newMode = 'longBreak'
            newRemainingMs = ps.durations.longBreak * 60 * 1000
          } else {
            newMode = 'break'
            newRemainingMs = ps.durations.break * 60 * 1000
          }
        } else {
          newMode = 'work'
          newRemainingMs = ps.durations.work * 60 * 1000
        }

        set({
          pomodoroState: {
            ...ps,
            isRunning: false,
            endTime: null,
            mode: newMode,
            remainingMs: newRemainingMs,
            completedSessions: newCount,
          },
        })
      },
    }),
    {
      name: 'dsa-grind-app-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage
      ),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        timerState: state.timerState,
        pomodoroState: state.pomodoroState,
      }),
    }
  )
)
