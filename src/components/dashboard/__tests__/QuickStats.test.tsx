import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuickStats from '../QuickStats'

const mockStats = {
  totalSolved: 42,
  solvedByDifficulty: { easy: 20, medium: 15, hard: 7 },
  averageTime: 30,
}

describe('QuickStats', () => {
  it('shows total solved count', () => {
    render(<QuickStats stats={mockStats} />)
    expect(screen.getByText('42')).toBeDefined()
  })

  it('shows difficulty breakdown', () => {
    render(<QuickStats stats={mockStats} />)
    expect(screen.getByText(/E:20/)).toBeDefined()
    expect(screen.getByText(/M:15/)).toBeDefined()
    expect(screen.getByText(/H:7/)).toBeDefined()
  })

  it('shows average time', () => {
    render(<QuickStats stats={mockStats} />)
    expect(screen.getByText('30m')).toBeDefined()
  })

  it('shows completion percentage', () => {
    render(<QuickStats stats={mockStats} />)
    expect(screen.getByText('28%')).toBeDefined()
  })

  it('shows 0 when no problems solved', () => {
    render(<QuickStats stats={{ totalSolved: 0, solvedByDifficulty: { easy: 0, medium: 0, hard: 0 }, averageTime: 0 }} />)
    expect(screen.getByText('0')).toBeDefined()
    expect(screen.getByText('0%')).toBeDefined()
  })

  it('shows -- for average time when zero', () => {
    render(<QuickStats stats={{ totalSolved: 5, solvedByDifficulty: { easy: 5, medium: 0, hard: 0 }, averageTime: 0 }} />)
    expect(screen.getByText('--')).toBeDefined()
  })
})
