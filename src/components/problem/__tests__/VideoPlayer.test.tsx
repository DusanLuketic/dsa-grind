import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VideoPlayer from '../VideoPlayer'

describe('VideoPlayer', () => {
  it('renders iframe for direct YouTube video URL', () => {
    render(<VideoPlayer youtubeUrl="https://www.youtube.com/watch?v=abc123" title="Test Problem" />)
    const iframe = screen.getByTitle('Test Problem')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/abc123')
  })

  it('renders search fallback for non-direct URL', () => {
    render(<VideoPlayer youtubeUrl="https://www.youtube.com/results?search_query=test" title="Test Problem" />)
    expect(screen.getByText(/search on youtube/i)).toBeDefined()
    expect(screen.getByText(/no direct video available/i)).toBeDefined()
  })

  it('renders search fallback when videoId is missing', () => {
    render(<VideoPlayer youtubeUrl="https://www.youtube.com/" title="Test Problem" />)
    expect(screen.getByText(/search on youtube/i)).toBeDefined()
  })

  it('links to original YouTube URL in fallback', () => {
    const url = 'https://www.youtube.com/results?search_query=two+sum'
    render(<VideoPlayer youtubeUrl={url} title="Two Sum" />)
    const link = screen.getByText(/search on youtube/i).closest('a')
    expect(link?.getAttribute('href')).toBe(url)
    expect(link?.getAttribute('target')).toBe('_blank')
  })
})
