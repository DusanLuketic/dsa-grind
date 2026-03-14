import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    studySession: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createSession, getSessions } from '../sessions'

const mockPrisma = prisma as unknown as {
  studySession: {
    create: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
}

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a session with duration and problemsSolved', async () => {
    mockPrisma.studySession.create.mockResolvedValue({ id: 1, duration: 25, problemsSolved: 3 })

    await createSession({ duration: 25, problemsSolved: 3 })

    expect(mockPrisma.studySession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ duration: 25, problemsSolved: 3 }),
    })
  })

  it('calls revalidatePath after creating session', async () => {
    mockPrisma.studySession.create.mockResolvedValue({ id: 1, duration: 25, problemsSolved: 3 })

    await createSession({ duration: 25, problemsSolved: 3 })

    expect(revalidatePath).toHaveBeenCalled()
  })
})

describe('getSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns session history', async () => {
    const mockSessions = [{ id: 1, duration: 25, problemsSolved: 3, date: new Date() }]
    mockPrisma.studySession.findMany.mockResolvedValue(mockSessions)

    const result = await getSessions()

    expect(result).toEqual(mockSessions)
    expect(mockPrisma.studySession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { date: 'desc' },
      })
    )
  })
})
