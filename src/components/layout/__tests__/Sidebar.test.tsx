import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/link
vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockLink({ children, ...props }: any) {
    return <a {...props}>{children}</a>
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock zustand store
vi.mock('@/store/useAppStore', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppStore: vi.fn((selector: any) => {
    const state = {
      sidebarOpen: false,
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders DSA Grind title', () => {
    render(<Sidebar solvedCount={0} totalCount={150} />)
    expect(screen.getByText('DSA Grind')).toBeDefined()
  })

  it('renders 5 navigation links', () => {
    render(<Sidebar solvedCount={0} totalCount={150} />)
    const navLinks = screen.getAllByRole('link')
    expect(navLinks.length).toBeGreaterThanOrEqual(5)
  })

  it('shows correct navigation items', () => {
    render(<Sidebar solvedCount={0} totalCount={150} />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Roadmap')).toBeDefined()
    expect(screen.getByText('Resources')).toBeDefined()
  })

  it('shows progress bar with solved count', () => {
    render(<Sidebar solvedCount={42} totalCount={150} />)
    expect(screen.getByText(/42.*150|42 \/ 150/)).toBeDefined()
  })

  it('shows 0 solved when no problems done', () => {
    render(<Sidebar solvedCount={0} totalCount={150} />)
    expect(screen.getByText(/0.*150|0 \/ 150/)).toBeDefined()
  })
})
