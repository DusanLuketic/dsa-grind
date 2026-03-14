import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/link
vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  },
}))

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/topic/arrays-hashing')
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { Breadcrumbs } from '../Breadcrumbs'

describe('Breadcrumbs', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/topic/arrays-hashing')
  })

  it('renders nothing on root path', () => {
    mockUsePathname.mockReturnValue('/')
    const { container } = render(<Breadcrumbs />)
    expect(container.firstChild).toBeNull()
  })

  it('renders Dashboard link as first breadcrumb', () => {
    render(<Breadcrumbs />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    const dashLink = screen.getByText('Dashboard').closest('a')
    expect(dashLink?.getAttribute('href')).toBe('/')
  })

  it('renders breadcrumb for topic page', () => {
    render(<Breadcrumbs />)
    expect(screen.getByText('Topics')).toBeDefined()
  })

  it('renders correct segments for nested route', () => {
    render(<Breadcrumbs />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('formats slug segments to title case', () => {
    render(<Breadcrumbs />)
    expect(screen.getByText('Arrays Hashing')).toBeDefined()
  })

  it('renders last segment as non-link text', () => {
    render(<Breadcrumbs />)
    const lastSegment = screen.getByText('Arrays Hashing')
    expect(lastSegment.closest('a')).toBeNull()
  })

  it('has correct aria-label for accessibility', () => {
    render(<Breadcrumbs />)
    expect(screen.getByLabelText('Breadcrumb')).toBeDefined()
  })
})
