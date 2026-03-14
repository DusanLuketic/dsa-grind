import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/store/useAppStore'

vi.useFakeTimers()

describe('useTimer', () => {
  beforeEach(() => {
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 0, problemId: null },
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('returns formatted time as 00:00 initially', async () => {
    const { useTimer } = await import('../useTimer')
    const { result } = renderHook(() => useTimer())
    expect(result.current.formattedTime).toBe('00:00')
  })

  it('start function starts the timer', async () => {
    const { useTimer } = await import('../useTimer')
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start(1))

    expect(result.current.isRunning).toBe(true)
  })

  it('pause function pauses the timer', async () => {
    const { useTimer } = await import('../useTimer')
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start(1))
    act(() => result.current.pause())

    expect(result.current.isRunning).toBe(false)
  })

  it('reset function resets elapsed to 0', async () => {
    const { useTimer } = await import('../useTimer')
    const { result } = renderHook(() => useTimer())

    act(() => {
      useAppStore.setState({
        timerState: { isRunning: false, startedAt: null, elapsed: 5000, problemId: 1 },
      })
    })

    act(() => result.current.reset())

    expect(result.current.elapsed).toBe(0)
  })
})
