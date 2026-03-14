import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    progress: {
      findMany: vi.fn().mockResolvedValue([
        {
          problemId: 1,
          problem: { slug: 'two-sum', title: 'Two Sum' },
          status: 'SOLVED',
          solvedAt: new Date('2026-03-01'),
          notes: null,
          timeSpent: 30,
          revisitCount: 0,
          confidence: 4,
        },
      ]),
      upsert: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    studySession: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { GET, POST } from '../route'

describe('GET /api/data', () => {
  it('returns JSON with progress and sessions arrays', async () => {
    const response = await GET()
    const data = await response.json()
    expect(Array.isArray(data.progress)).toBe(true)
    expect(Array.isArray(data.sessions)).toBe(true)
  })

  it('includes problem slug in progress data', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.progress[0].problemSlug).toBe('two-sum')
  })
})

describe('POST /api/data', () => {
  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest('http://localhost/api/data', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns imported counts for valid data', async () => {
    const body = {
      progress: [{ problemId: 1, status: 'SOLVED' }],
      sessions: [],
    }
    const request = new NextRequest('http://localhost/api/data', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    const data = await response.json()
    expect(data.imported).toBeDefined()
    expect(typeof data.imported.progress).toBe('number')
  })
})
