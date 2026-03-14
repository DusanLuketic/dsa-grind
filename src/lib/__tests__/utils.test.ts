import { describe, it, expect } from 'vitest'
import { cn, formatTime, getDifficultyColor, slugify, getProblemLinkLabel } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})

describe('formatTime', () => {
  it('formats minutes under an hour', () => {
    expect(formatTime(30)).toBe('30m')
  })
  it('formats exactly 1 hour', () => {
    expect(formatTime(60)).toBe('1h')
  })
  it('formats hours and minutes', () => {
    expect(formatTime(90)).toBe('1h 30m')
  })
})

describe('getDifficultyColor', () => {
  it('returns green for EASY', () => {
    expect(getDifficultyColor('EASY')).toBe('text-green-500')
  })
  it('returns yellow for MEDIUM', () => {
    expect(getDifficultyColor('MEDIUM')).toBe('text-yellow-500')
  })
  it('returns red for HARD', () => {
    expect(getDifficultyColor('HARD')).toBe('text-red-500')
  })
})

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Arrays & Hashing')).toBe('arrays-hashing')
  })
})

describe('getProblemLinkLabel', () => {
  it('returns LeetCode label for leetcode URLs', () => {
    expect(getProblemLinkLabel('https://leetcode.com/problems/two-sum/')).toBe('Open on LeetCode')
  })
  it('returns NeetCode label for neetcode URLs', () => {
    expect(getProblemLinkLabel('https://neetcode.io/problems/dynamicArray/question')).toBe('Open on NeetCode')
  })
  it('returns fallback for invalid URLs', () => {
    expect(getProblemLinkLabel('not-a-url')).toBe('Open Problem')
  })
})

describe('TOPICS constant', () => {
  it('has exactly 26 topics', async () => {
    const { TOPICS } = await import('../constants')
    expect(TOPICS.length).toBe(26)
  })
  it('has 18 neetcode-150 topics', async () => {
    const { getTopicsByProblemSet } = await import('../constants')
    expect(getTopicsByProblemSet('neetcode-150').length).toBe(18)
  })
  it('has 7 core-skills topics', async () => {
    const { getTopicsByProblemSet } = await import('../constants')
    expect(getTopicsByProblemSet('core-skills').length).toBe(7)
  })
  it('has 1 system-design topic', async () => {
    const { getTopicsByProblemSet } = await import('../constants')
    expect(getTopicsByProblemSet('system-design').length).toBe(1)
  })
})

describe('ROADMAP_EDGES constant', () => {
  it('has arrays-hashing pointing to two-pointers and stack', async () => {
    const { ROADMAP_EDGES } = await import('../constants')
    expect(ROADMAP_EDGES['arrays-hashing']).toEqual(['two-pointers', 'stack'])
  })
})
