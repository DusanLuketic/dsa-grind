import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StreakTracker from '../StreakTracker'

describe('StreakTracker', () => {
  it('shows current streak count', () => {
    render(
      <StreakTracker
        streakData={{ currentStreak: 5, totalActiveDays: 12 }}
        todaySolved={[]}
      />
    )
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText(/day streak/)).toBeDefined()
  })

  it('shows total active days', () => {
    render(
      <StreakTracker
        streakData={{ currentStreak: 3, totalActiveDays: 20 }}
        todaySolved={[]}
      />
    )
    expect(screen.getByText(/20 total active days/)).toBeDefined()
  })

  it('shows today solved problems', () => {
    render(
      <StreakTracker
        streakData={{ currentStreak: 1, totalActiveDays: 1 }}
        todaySolved={[{ id: 1, title: 'Two Sum', slug: 'two-sum' }]}
      />
    )
    expect(screen.getByText(/Two Sum/)).toBeDefined()
  })

  it('shows empty state when nothing solved today', () => {
    render(
      <StreakTracker
        streakData={{ currentStreak: 0, totalActiveDays: 0 }}
        todaySolved={[]}
      />
    )
    expect(screen.getByText(/No problems solved today/)).toBeDefined()
  })
})
