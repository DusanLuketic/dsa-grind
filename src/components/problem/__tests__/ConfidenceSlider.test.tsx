import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/actions/progress', () => ({
  updateProgress: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/toast', () => ({
  showError: vi.fn(),
}))

import { updateProgress } from '@/lib/actions/progress'
import ConfidenceSlider from '../ConfidenceSlider'

describe('ConfidenceSlider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders confidence slider', () => {
    render(<ConfidenceSlider problemId={1} initialConfidence={3} />)
    expect(screen.getByRole('slider')).toBeDefined()
  })

  it('shows confidence label', () => {
    render(<ConfidenceSlider problemId={1} initialConfidence={3} />)
    expect(screen.getByText('Getting it')).toBeDefined()
  })

  it('updates the label immediately and saves after the debounce window', async () => {
    render(<ConfidenceSlider problemId={1} initialConfidence={3} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } })

    expect(screen.getByText('Mastered')).toBeInTheDocument()
    expect(updateProgress).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    expect(updateProgress).toHaveBeenCalledWith(1, { confidence: 5 })
  })

  it('debounces rapid slider changes to the latest value', async () => {
    render(<ConfidenceSlider problemId={1} initialConfidence={2} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })
    fireEvent.change(slider, { target: { value: '5' } })

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(updateProgress).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(1)
      await Promise.resolve()
    })

    expect(updateProgress).toHaveBeenCalledTimes(1)
    expect(updateProgress).toHaveBeenCalledWith(1, { confidence: 5 })
  })
})
