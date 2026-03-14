import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppStore } from '@/store/useAppStore'

vi.mock('../StatusSelector', () => ({
  default: ({ onStatusChange }: { onStatusChange?: (status: string) => void }) => (
    <button onClick={() => onStatusChange?.('SOLVED')} type="button">
      Mark solved
    </button>
  ),
}))

vi.mock('../ConfidenceSlider', () => ({
  default: () => <div>Confidence slider</div>,
}))

vi.mock('../ProblemTimer', () => ({
  default: () => <div>Problem timer</div>,
}))

vi.mock('../NotesEditor', () => ({
  default: () => <div>Notes editor</div>,
}))

import ProblemControls from '../ProblemControls'

describe('ProblemControls', () => {
  beforeEach(() => {
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 0, problemId: 1 },
    })
  })

  it('shows the save dialog when a solved status has tracked time', () => {
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 31000, problemId: 1 },
    })

    render(
      <ProblemControls
        problemId={1}
        initialStatus="NOT_STARTED"
        initialConfidence={3}
        initialNotes={null}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /mark solved/i }))

    expect(screen.getByText(/save time spent/i)).toBeInTheDocument()
  })

  it('does not show the save dialog for short elapsed times', () => {
    useAppStore.setState({
      timerState: { isRunning: false, startedAt: null, elapsed: 15000, problemId: 1 },
    })

    render(
      <ProblemControls
        problemId={1}
        initialStatus="NOT_STARTED"
        initialConfidence={3}
        initialNotes={null}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /mark solved/i }))

    expect(screen.queryByText(/save time spent/i)).not.toBeInTheDocument()
  })
})
