import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import ProgressOverview from '../ProgressOverview'

const mockTopics = [
  { id: 'arrays-hashing', title: 'Arrays & Hashing', slug: 'arrays-hashing', icon: '🔢', color: '#3b82f6' },
  { id: 'two-pointers', title: 'Two Pointers', slug: 'two-pointers', icon: '👆', color: '#8b5cf6' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', slug: 'bit-manipulation', icon: '⚙️', color: '#38bdf8' },
]

const mockTopicProgress = [
  { topicId: 'arrays-hashing', solved: 5, total: 9 },
  { topicId: 'two-pointers', solved: 0, total: 5 },
]

describe('ProgressOverview', () => {
  it('shows provided topics', () => {
    render(<ProgressOverview topics={mockTopics} topicProgress={mockTopicProgress} />)
    expect(screen.getByText('Arrays & Hashing')).toBeDefined()
    expect(screen.getByText('Two Pointers')).toBeDefined()
    expect(screen.getByText('Bit Manipulation')).toBeDefined()
  })

  it('shows solved/total counts', () => {
    render(<ProgressOverview topics={mockTopics} topicProgress={mockTopicProgress} />)
    expect(screen.getByText('5/9')).toBeDefined()
    expect(screen.getByText('0/5')).toBeDefined()
  })

  it('links to topic pages', () => {
    render(<ProgressOverview topics={mockTopics} topicProgress={mockTopicProgress} />)
    const links = screen.getAllByRole('link')
    const arraysLink = links.find((l) => l.getAttribute('href') === '/topic/arrays-hashing')
    expect(arraysLink).toBeDefined()
  })
})
