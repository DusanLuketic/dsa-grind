import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import TopicNode from '../TopicNode'

const mockTopic = {
  id: 'arrays-hashing',
  title: 'Arrays & Hashing',
  slug: 'arrays-hashing',
  icon: '🔢',
  color: '#3b82f6',
  solved: 0,
  total: 9,
}

describe('TopicNode', () => {
  it('renders topic title', () => {
    render(<TopicNode topic={mockTopic} />)
    expect(screen.getByText('Arrays & Hashing')).toBeDefined()
  })

  it('links to topic page', () => {
    render(<TopicNode topic={mockTopic} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/topic/arrays-hashing')
  })

  it('has indigo background styling', () => {
    render(<TopicNode topic={mockTopic} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-indigo-700')
  })

  it('renders a progress bar', () => {
    render(<TopicNode topic={mockTopic} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeDefined()
  })

  it('shows partial progress when some problems are solved', () => {
    render(<TopicNode topic={{ ...mockTopic, solved: 5 }} />)
    const progressBar = screen.getByRole('progressbar')
    const widthPercent = (5 / 9) * 100
    expect(progressBar.style.width).toBe(`${widthPercent}%`)
  })

  it('shows full progress when all problems are solved', () => {
    render(<TopicNode topic={{ ...mockTopic, solved: 9 }} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar.style.width).toBe('100%')
  })
})
