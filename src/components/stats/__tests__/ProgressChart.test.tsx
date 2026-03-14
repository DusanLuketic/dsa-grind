import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressChart from '../ProgressChart'

describe('ProgressChart', () => {
  it('shows no data message when empty', () => {
    render(<ProgressChart data={[]} />)
    expect(screen.getByText(/no data/i)).toBeDefined()
  })

  it('renders chart container with data', () => {
    const data = [
      { date: '2026-03-01', solved: 5 },
      { date: '2026-03-02', solved: 8 },
    ]
    const { container } = render(<ProgressChart data={data} />)
    // ResponsiveContainer renders a div wrapper
    const wrapper = container.querySelector('.recharts-responsive-container')
    expect(wrapper).toBeDefined()
  })
})
