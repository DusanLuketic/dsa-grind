import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReviewList from '../ReviewList'

const mockProblems = [
  {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'EASY',
    topicTitle: 'Arrays & Hashing',
    confidence: 2,
    status: 'ATTEMPTED',
  },
  {
    id: 2,
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'EASY',
    topicTitle: 'Arrays & Hashing',
    confidence: null,
    status: 'REVIEW',
  },
]

describe('ReviewList', () => {
  it('renders nothing when empty', () => {
    const { container } = render(<ReviewList problems={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders problem titles as links', () => {
    render(<ReviewList problems={mockProblems} />)
    const link = screen.getByText('Two Sum')
    expect(link).toBeDefined()
    expect(link.closest('a')?.getAttribute('href')).toBe('/problem/two-sum')
  })

  it('shows difficulty badge', () => {
    render(<ReviewList problems={mockProblems} />)
    const badges = screen.getAllByText('EASY')
    expect(badges.length).toBe(2)
  })

  it('shows confidence when available', () => {
    render(<ReviewList problems={mockProblems} />)
    expect(screen.getByText('conf:2/5')).toBeDefined()
  })

  it('shows topic title', () => {
    render(<ReviewList problems={mockProblems} />)
    const topics = screen.getAllByText('Arrays & Hashing')
    expect(topics.length).toBe(2)
  })

  it('shows status label', () => {
    render(<ReviewList problems={mockProblems} />)
    expect(screen.getByText('Attempted')).toBeDefined()
    expect(screen.getByText('Review')).toBeDefined()
  })
})
