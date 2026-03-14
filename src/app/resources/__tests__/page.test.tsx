import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResourceCard } from '../ResourceCard'

describe('ResourceCard', () => {
  it('renders resource title', () => {
    const resource = {
      id: 1,
      title: 'NeetCode',
      url: 'https://neetcode.io',
      type: 'VIDEO',
      source: 'YouTube',
      description: 'DSA video channel',
      topicId: null,
    }
    render(<ResourceCard resource={resource} />)
    expect(screen.getByText('NeetCode')).toBeDefined()
  })

  it('renders visit link with correct href', () => {
    const resource = {
      id: 1,
      title: 'NeetCode',
      url: 'https://neetcode.io',
      type: 'VIDEO',
      source: 'YouTube',
      description: 'DSA video channel',
      topicId: null,
    }
    render(<ResourceCard resource={resource} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('https://neetcode.io')
  })

  it('renders source badge', () => {
    const resource = {
      id: 1,
      title: 'NeetCode',
      url: 'https://neetcode.io',
      type: 'VIDEO',
      source: 'YouTube',
      description: 'DSA video channel',
      topicId: null,
    }
    render(<ResourceCard resource={resource} />)
    expect(screen.getByText('YouTube')).toBeDefined()
  })

  it('renders description when provided', () => {
    const resource = {
      id: 1,
      title: 'NeetCode',
      url: 'https://neetcode.io',
      type: 'VIDEO',
      source: 'YouTube',
      description: 'DSA video channel',
      topicId: null,
    }
    render(<ResourceCard resource={resource} />)
    expect(screen.getByText('DSA video channel')).toBeDefined()
  })

  it('opens link in new tab', () => {
    const resource = {
      id: 1,
      title: 'NeetCode',
      url: 'https://neetcode.io',
      type: 'VIDEO',
      source: 'YouTube',
      description: 'DSA video channel',
      topicId: null,
    }
    render(<ResourceCard resource={resource} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
