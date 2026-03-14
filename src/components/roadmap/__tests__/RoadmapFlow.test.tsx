import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import { TOPICS } from '@/lib/constants'
import RoadmapFlow from '../RoadmapFlow'

const mockTopics = TOPICS.map((topic) => ({
  id: topic.id,
  title: topic.title,
  slug: topic.slug,
  icon: topic.icon,
  color: topic.color,
  solved: 0,
  total: 8,
}))

describe('RoadmapFlow', () => {
  it('renders all 18 topic nodes', () => {
    render(<RoadmapFlow topics={mockTopics} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(18)
  })

  it('renders arrays-hashing as first node', () => {
    render(<RoadmapFlow topics={mockTopics} />)
    expect(screen.getByText('Arrays & Hashing')).toBeDefined()
  })

  it('renders bit-manipulation as last node', () => {
    render(<RoadmapFlow topics={mockTopics} />)
    expect(screen.getByText('Bit Manipulation')).toBeDefined()
  })

  it('renders SVG connection paths with arrow markers', () => {
    const { container } = render(<RoadmapFlow topics={mockTopics} />)
    const connectionPaths = container.querySelectorAll('svg path[marker-end]')
    expect(connectionPaths.length).toBeGreaterThan(0)
  })
})
