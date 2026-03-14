import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/actions/progress', () => ({
  updateProgress: vi.fn().mockResolvedValue({}),
}))

import ProblemTable from '../ProblemTable'

const mockProblems = [
  {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'EASY',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    youtubeUrl: 'https://youtube.com/watch?v=abc',
    order: 1,
    pattern: 'Arrays',
    progress: { status: 'NOT_STARTED', confidence: null },
  },
  {
    id: 2,
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'EASY',
    leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    youtubeUrl: 'https://youtube.com/watch?v=def',
    order: 2,
    pattern: 'Arrays',
    progress: { status: 'SOLVED', confidence: 4 },
  },
]

describe('ProblemTable', () => {
  it('renders all problems', () => {
    render(<ProblemTable problems={mockProblems} />)
    expect(screen.getByText('Two Sum')).toBeDefined()
    expect(screen.getByText('Valid Anagram')).toBeDefined()
  })

  it('shows status icons', () => {
    render(<ProblemTable problems={mockProblems} />)
    expect(screen.getByText('\u2B55')).toBeDefined()
    expect(screen.getByText('\u2705')).toBeDefined()
  })

  it('links to problem page', () => {
    render(<ProblemTable problems={mockProblems} />)
    const link = screen.getByRole('link', { name: 'Two Sum' })
    expect(link.getAttribute('href')).toBe('/problem/two-sum')
  })

  it('shows empty state when no problems match filter', () => {
    render(<ProblemTable problems={[]} />)
    expect(screen.getByText(/no problems match/i)).toBeDefined()
  })
})
