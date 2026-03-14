'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface TimerState {
  isRunning: boolean
  startedAt: number | null
  elapsed: number
  problemId: number | null
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
    }),
    {
      name: 'dsa-grind-app-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage
      ),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        timerState: state.timerState,
      }),
    }
  )
)
