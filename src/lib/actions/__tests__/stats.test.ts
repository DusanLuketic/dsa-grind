import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    progress: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    studySession: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

import { prisma } from '@/lib/db'
import { getActivityData, getStats, getStreakData } from '../stats'

const mockPrisma = prisma as unknown as {
  progress: {
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    aggregate: ReturnType<typeof vi.fn>
  }
  studySession: {
    findMany: ReturnType<typeof vi.fn>
  }
  $queryRaw: ReturnType<typeof vi.fn>
}

describe('getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns stats with totalSolved and solvedByDifficulty', async () => {
    mockPrisma.progress.count.mockResolvedValue(42)
    mockPrisma.progress.aggregate.mockResolvedValue({ _avg: { timeSpent: 30 } })
    mockPrisma.$queryRaw.mockResolvedValue([
      { difficulty: 'EASY', count: 20 },
      { difficulty: 'MEDIUM', count: 15 },
      { difficulty: 'HARD', count: 7 },
    ])

    const stats = await getStats()

    expect(stats.totalSolved).toBe(42)
    expect(stats.solvedByDifficulty.easy).toBe(20)
    expect(stats.solvedByDifficulty.medium).toBe(15)
    expect(stats.solvedByDifficulty.hard).toBe(7)
    expect(stats.averageTime).toBe(30)
  })
})

describe('getActivityData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns activity data in correct format', async () => {
    mockPrisma.progress.findMany.mockResolvedValue([
      { solvedAt: new Date('2026-03-01') },
      { solvedAt: new Date('2026-03-01') },
    ])
    mockPrisma.studySession.findMany.mockResolvedValue([{ date: new Date('2026-03-02') }])

    const data = await getActivityData()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    const marchFirst = data.find((entry) => entry.date === '2026-03-01')
    const marchSecond = data.find((entry) => entry.date === '2026-03-02')

    expect(marchFirst).toEqual(expect.objectContaining({ date: '2026-03-01', count: 2, level: 2 }))
    expect(marchSecond).toEqual(expect.objectContaining({ date: '2026-03-02', count: 1, level: 1 }))
  })
})

describe('getStreakData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns current streak count', async () => {
    mockPrisma.progress.findMany.mockResolvedValue([])
    mockPrisma.studySession.findMany.mockResolvedValue([])

    const streak = await getStreakData()

    expect(typeof streak.currentStreak).toBe('number')
    expect(streak.currentStreak).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(streak.activityDates)).toBe(true)
  })
})
