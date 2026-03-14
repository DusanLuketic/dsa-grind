import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import ProgressOverview from '../ProgressOverview'

const mockTopicProgress = [
  { topicId: 'arrays-hashing', solved: 5, total: 9 },
  { topicId: 'two-pointers', solved: 0, total: 5 },
]

describe('ProgressOverview', () => {
  it('shows all 18 topics', () => {
    render(<ProgressOverview topicProgress={mockTopicProgress} />)
    expect(screen.getByText('Arrays & Hashing')).toBeDefined()
    expect(screen.getByText('Two Pointers')).toBeDefined()
    expect(screen.getByText('Bit Manipulation')).toBeDefined()
  })

  it('shows solved/total counts', () => {
    render(<ProgressOverview topicProgress={mockTopicProgress} />)
    expect(screen.getByText('5/9')).toBeDefined()
    expect(screen.getByText('0/5')).toBeDefined()
  })

  it('links to topic pages', () => {
    render(<ProgressOverview topicProgress={mockTopicProgress} />)
    const links = screen.getAllByRole('link')
    const arraysLink = links.find((l) => l.getAttribute('href') === '/topic/arrays-hashing')
    expect(arraysLink).toBeDefined()
  })
})
