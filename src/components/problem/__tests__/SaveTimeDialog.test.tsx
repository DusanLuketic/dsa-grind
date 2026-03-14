import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/actions/progress', () => ({
  updateProgress: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/toast', () => ({
  showSuccess: vi.fn(),
}))

import { updateProgress } from '@/lib/actions/progress'
import { showSuccess } from '@/lib/toast'
import { useAppStore } from '@/store/useAppStore'
import SaveTimeDialog from '../SaveTimeDialog'

describe('SaveTimeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 125000, problemId: 1 },
    })
  })

  it('saves rounded elapsed minutes and resets the timer', async () => {
    const onClose = vi.fn()

    render(<SaveTimeDialog problemId={1} elapsedMs={125000} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /save 2min/i }))

    await waitFor(() => {
      expect(updateProgress).toHaveBeenCalledWith(1, { timeSpent: 2 })
      expect(showSuccess).toHaveBeenCalledWith('Saved 2min time spent')
      expect(onClose).toHaveBeenCalled()
    })

    expect(useAppStore.getState().timerState.elapsed).toBe(0)
  })

  it('skips saving and still resets the timer', () => {
    const onClose = vi.fn()

    render(<SaveTimeDialog problemId={1} elapsedMs={125000} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /skip/i }))

    expect(updateProgress).not.toHaveBeenCalled()
    expect(useAppStore.getState().timerState.elapsed).toBe(0)
    expect(onClose).toHaveBeenCalled()
  })
})
