import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../useAppStore'

describe('useAppStore - sidebar', () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarOpen: false })
  })

  it('starts with sidebar closed', () => {
    const { result } = renderHook(() => useAppStore())
    expect(result.current.sidebarOpen).toBe(false)
  })

  it('toggles sidebar open', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.toggleSidebar())
    expect(result.current.sidebarOpen).toBe(true)
  })

  it('sets sidebar with setSidebarOpen', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setSidebarOpen(true))
    expect(result.current.sidebarOpen).toBe(true)
  })
})

describe('useAppStore - timer', () => {
  beforeEach(() => {
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 0, problemId: null },
    })
  })

  it('starts timer with problem id', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.startTimer(42))
    expect(result.current.timerState.isRunning).toBe(true)
    expect(result.current.timerState.problemId).toBe(42)
    expect(result.current.timerState.startedAt).not.toBeNull()
  })

  it('pauses timer and stores elapsed', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      useAppStore.setState({
        timerState: { isRunning: true, startedAt: Date.now() - 5000, elapsed: 0, problemId: 1 },
      })
    })

    act(() => result.current.pauseTimer())

    expect(result.current.timerState.isRunning).toBe(false)
    expect(result.current.timerState.elapsed).toBeGreaterThan(0)
  })

  it('resets timer to zero', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      useAppStore.setState({
        timerState: { isRunning: false, startedAt: null, elapsed: 10000, problemId: 1 },
      })
    })

    act(() => result.current.resetTimer())

    expect(result.current.timerState.elapsed).toBe(0)
    expect(result.current.timerState.isRunning).toBe(false)
    expect(result.current.timerState.startedAt).toBeNull()
  })

  it('getElapsed returns timestamp-based time when running', () => {
    const { result } = renderHook(() => useAppStore())

    const startedAt = Date.now() - 3000
    act(() => {
      useAppStore.setState({
        timerState: { isRunning: true, startedAt, elapsed: 0, problemId: 1 },
      })
    })

    const elapsed = result.current.getElapsed()
    expect(elapsed).toBeGreaterThanOrEqual(2900)
    expect(elapsed).toBeLessThan(4000)
  })
})

describe('useAppStore - activeProblemSet', () => {
  beforeEach(() => {
    useAppStore.setState({ activeProblemSet: 'neetcode-150' })
  })

  it('defaults to neetcode-150', () => {
    const { result } = renderHook(() => useAppStore())
    expect(result.current.activeProblemSet).toBe('neetcode-150')
  })

  it('updates with setActiveProblemSet', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setActiveProblemSet('core-skills'))
    expect(result.current.activeProblemSet).toBe('core-skills')
  })

  it('can switch to system-design', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setActiveProblemSet('system-design'))
    expect(result.current.activeProblemSet).toBe('system-design')
  })
})
