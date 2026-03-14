import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityHeatmap from '../ActivityHeatmap'

describe('ActivityHeatmap', () => {
  it('shows no activity message when empty', () => {
    render(<ActivityHeatmap data={[]} />)
    expect(screen.getByText(/no activity data/i)).toBeDefined()
  })

  it('renders SVG with data', () => {
    const data = [
      { date: '2026-03-10', count: 2, level: 2 },
      { date: '2026-03-11', count: 0, level: 0 },
      { date: '2026-03-12', count: 5, level: 4 },
    ]
    render(<ActivityHeatmap data={data} />)
    const svg = screen.getByRole('img', { name: /activity heatmap/i })
    expect(svg).toBeDefined()
  })

  it('renders correct number of filled cells', () => {
    const data = [
      { date: '2026-03-10', count: 1, level: 1 },
      { date: '2026-03-11', count: 3, level: 2 },
    ]
    const { container } = render(<ActivityHeatmap data={data} />)
    // Should have cells for data entries plus potential padding
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThanOrEqual(2)
  })
})
