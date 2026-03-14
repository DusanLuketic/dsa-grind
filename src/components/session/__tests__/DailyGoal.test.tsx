import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockStorage: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
})

import DailyGoal from '../DailyGoal'

describe('DailyGoal', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => {
      delete mockStorage[key]
    })
  })

  it('renders with default goal of 5', () => {
    render(<DailyGoal />)
    expect(screen.getByDisplayValue('5')).toBeDefined()
  })

  it('shows 0 problems completed initially', () => {
    render(<DailyGoal />)
    expect(screen.getByText('0')).toBeDefined()
  })

  it('shows daily goal reached message when goal met', () => {
    mockStorage['dsa-grind-daily-goal'] = JSON.stringify({
      goal: 1,
      completedToday: 1,
      date: new Date().toISOString().slice(0, 10),
    })

    render(<DailyGoal />)
    expect(screen.getByText(/daily goal reached/i)).toBeDefined()
  })
})
