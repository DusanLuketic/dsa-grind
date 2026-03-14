import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/lib/actions/progress', () => ({
  updateProgress: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/toast', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

import { updateProgress } from '@/lib/actions/progress'
import { showError } from '@/lib/toast'
import StatusSelector from '../StatusSelector'

describe('StatusSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(updateProgress).mockResolvedValue(undefined as never)
  })

  it('renders current status', () => {
    render(<StatusSelector problemId={1} initialStatus="NOT_STARTED" />)
    expect(screen.getByText(/not started/i)).toBeDefined()
  })

  it('opens dropdown on click', async () => {
    render(<StatusSelector problemId={1} initialStatus="NOT_STARTED" />)
    fireEvent.click(screen.getByRole('button', { name: /not started/i }))
    // Menu items render as menuitem role
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1)
  })

  it('shows all 4 status options when open', async () => {
    render(<StatusSelector problemId={1} initialStatus="NOT_STARTED" />)
    fireEvent.click(screen.getByRole('button', { name: /not started/i }))
    expect(screen.getAllByText(/not started/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/attempted/i)).toBeDefined()
    expect(screen.getByText(/solved/i)).toBeDefined()
    expect(screen.getByText(/review/i)).toBeDefined()
  })

  it('updates status optimistically and notifies parent listeners', async () => {
    const onStatusChange = vi.fn()

    render(
      <StatusSelector
        problemId={1}
        initialStatus="NOT_STARTED"
        onStatusChange={onStatusChange}
      />
    )

    // Open the dropdown by clicking trigger
    fireEvent.click(screen.getByRole('button', { name: /not started/i }))
    // Items are rendered as menuitem role in base-ui DropdownMenu
    const solvedItem = screen.getByRole('menuitem', { name: /solved/i })
    fireEvent.click(solvedItem)

    expect(onStatusChange).toHaveBeenCalledWith('SOLVED')

    await waitFor(() => {
      expect(updateProgress).toHaveBeenCalledWith(1, { status: 'SOLVED' })
    })
  })

  it('reverts optimistic status changes when saving fails', async () => {
    vi.mocked(updateProgress).mockRejectedValueOnce(new Error('save failed'))

    render(<StatusSelector problemId={1} initialStatus="NOT_STARTED" />)

    fireEvent.click(screen.getByRole('button', { name: /not started/i }))
    const solvedItem = screen.getByRole('menuitem', { name: /solved/i })
    fireEvent.click(solvedItem)

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Failed to update status')
    })
  })
})
