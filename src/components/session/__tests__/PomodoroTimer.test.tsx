import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useAppStore } from '@/store/useAppStore'

vi.useFakeTimers()

vi.mock('../useAudioNotification', () => ({
  useAudioNotification: () => ({
    playBeep: vi.fn(),
    requestPermission: vi.fn(),
  }),
}))

import PomodoroTimer from '../PomodoroTimer'

describe('PomodoroTimer', () => {
  beforeEach(() => {
    useAppStore.setState({
      pomodoroState: {
        durations: { work: 25, break: 5, longBreak: 15 },
        mode: 'work',
        isRunning: false,
        endTime: null,
        remainingMs: 25 * 60 * 1000,
        completedSessions: 0,
      },
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('shows 25:00 default work time', () => {
    render(<PomodoroTimer />)
    expect(screen.getByText('25:00')).toBeDefined()
  })

  it('shows Start button initially', () => {
    render(<PomodoroTimer />)
    expect(screen.getByRole('button', { name: /start/i })).toBeDefined()
  })

  it('shows Pause button when running', () => {
    render(<PomodoroTimer />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('button', { name: /pause/i })).toBeDefined()
  })

  it('resets to 25:00 on reset', () => {
    render(<PomodoroTimer />)
    fireEvent.click(screen.getByRole('button', { name: /start/i }))
    vi.advanceTimersByTime(5000)
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('25:00')).toBeDefined()
  })

  it('shows focus time mode label', () => {
    render(<PomodoroTimer />)
    expect(screen.getByText(/focus time/i)).toBeDefined()
  })
})
