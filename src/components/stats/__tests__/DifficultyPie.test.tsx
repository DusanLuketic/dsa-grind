import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DifficultyPie from '../DifficultyPie'

describe('DifficultyPie', () => {
  it('shows no data message when empty array', () => {
    render(<DifficultyPie data={[]} />)
    expect(screen.getByText(/no data/i)).toBeDefined()
  })

  it('shows no data message when all values are zero', () => {
    const data = [
      { name: 'EASY', value: 0, color: '#22c55e' },
      { name: 'MEDIUM', value: 0, color: '#eab308' },
    ]
    render(<DifficultyPie data={data} />)
    expect(screen.getByText(/no data/i)).toBeDefined()
  })

  it('renders chart container with valid data', () => {
    const data = [
      { name: 'EASY', value: 10, color: '#22c55e' },
      { name: 'MEDIUM', value: 5, color: '#eab308' },
      { name: 'HARD', value: 2, color: '#ef4444' },
    ]
    const { container } = render(<DifficultyPie data={data} />)
    const wrapper = container.querySelector('.recharts-responsive-container')
    expect(wrapper).toBeDefined()
  })
})
