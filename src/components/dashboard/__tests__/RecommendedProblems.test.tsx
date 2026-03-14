import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import RecommendedProblems from '../RecommendedProblems'

const mockProblems = [
  { id: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY', topicId: 'arrays-hashing', topic: { title: 'Arrays & Hashing' } },
  { id: 2, title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'EASY', topicId: 'arrays-hashing', topic: { title: 'Arrays & Hashing' } },
]

describe('RecommendedProblems', () => {
  it('shows problem titles', () => {
    render(<RecommendedProblems problems={mockProblems} />)
    expect(screen.getByText('Two Sum')).toBeDefined()
    expect(screen.getByText('Valid Anagram')).toBeDefined()
  })

  it('shows topic name', () => {
    render(<RecommendedProblems problems={mockProblems} />)
    const topicLabels = screen.getAllByText('Arrays & Hashing')
    expect(topicLabels.length).toBe(2)
  })

  it('shows difficulty badge', () => {
    render(<RecommendedProblems problems={mockProblems} />)
    const easyBadges = screen.getAllByText('EASY')
    expect(easyBadges.length).toBe(2)
  })

  it('links to problem page', () => {
    render(<RecommendedProblems problems={mockProblems} />)
    const links = screen.getAllByRole('link')
    expect(links[0].getAttribute('href')).toBe('/problem/two-sum')
  })

  it('shows empty state when no problems', () => {
    render(<RecommendedProblems problems={[]} />)
    expect(screen.getByText(/All problems solved/i)).toBeDefined()
  })
})
