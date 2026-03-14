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

  it('renders topic icon', () => {
    render(<TopicNode topic={mockTopic} />)
    expect(screen.getByText('🔢')).toBeDefined()
  })

  it('links to topic page', () => {
    render(<TopicNode topic={mockTopic} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/topic/arrays-hashing')
  })

  it('shows progress', () => {
    render(<TopicNode topic={mockTopic} />)
    expect(screen.getByText('0/9')).toBeDefined()
  })

  it('shows solved progress when partially complete', () => {
    render(<TopicNode topic={{ ...mockTopic, solved: 5 }} />)
    expect(screen.getByText('5/9')).toBeDefined()
  })

  it('uses yellow styling when partially complete', () => {
    render(<TopicNode topic={{ ...mockTopic, solved: 3 }} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('border-yellow-500/70')
  })

  it('uses green styling when complete', () => {
    render(<TopicNode topic={{ ...mockTopic, solved: 9 }} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('border-green-500/70')
  })
})
