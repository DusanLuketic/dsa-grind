import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProblemInfo from '../ProblemInfo'

const mockProblem = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'EASY',
  leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
  hints: 'Use a hash map',
  pattern: 'Arrays & Hashing',
  topic: { title: 'Arrays & Hashing', slug: 'arrays-hashing' },
}

describe('ProblemInfo', () => {
  it('renders problem title', () => {
    render(<ProblemInfo problem={mockProblem} />)
    expect(screen.getByText('Two Sum')).toBeDefined()
  })

  it('renders difficulty badge', () => {
    render(<ProblemInfo problem={mockProblem} />)
    expect(screen.getByText('EASY')).toBeDefined()
  })

  it('renders pattern badge', () => {
    render(<ProblemInfo problem={mockProblem} />)
    expect(screen.getByText('Arrays & Hashing')).toBeDefined()
  })

  it('renders LeetCode link', () => {
    render(<ProblemInfo problem={mockProblem} />)
    const link = screen.getByText(/open on leetcode/i).closest('a')
    expect(link?.getAttribute('href')).toBe('https://leetcode.com/problems/two-sum/')
    expect(link?.getAttribute('target')).toBe('_blank')
  })

  it('renders NeetCode search link', () => {
    render(<ProblemInfo problem={mockProblem} />)
    expect(screen.getByText(/neetcode search/i)).toBeDefined()
  })

  it('renders hints section when hints exist', () => {
    render(<ProblemInfo problem={mockProblem} />)
    expect(screen.getByText(/show hints/i)).toBeDefined()
    expect(screen.getByText('Use a hash map')).toBeDefined()
  })

  it('does not render hints section when hints are null', () => {
    render(<ProblemInfo problem={{ ...mockProblem, hints: null }} />)
    expect(screen.queryByText(/show hints/i)).toBeNull()
  })

  it('does not render pattern badge when pattern is null', () => {
    const { container } = render(<ProblemInfo problem={{ ...mockProblem, pattern: null }} />)
    // Should still render difficulty badge, but no pattern badge
    expect(screen.getByText('EASY')).toBeDefined()
    const badges = container.querySelectorAll('[data-slot="badge"]')
    expect(badges.length).toBe(1)
  })

  it('renders NeetCode link label for neetcode URLs', () => {
    render(
      <ProblemInfo
        problem={{
          ...mockProblem,
          leetcodeUrl: 'https://neetcode.io/problems/dynamicArray/question',
        }}
      />
    )
    expect(screen.getByText(/open on neetcode/i)).toBeDefined()
  })
})
