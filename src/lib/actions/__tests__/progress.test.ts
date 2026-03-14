import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    progress: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getProgressByTopic, updateProgress } from '../progress'

const mockPrisma = prisma as unknown as {
  progress: {
    upsert: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
}

describe('updateProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('upserts progress record with provided data', async () => {
    mockPrisma.progress.upsert.mockResolvedValue({ id: 1, problemId: 1, status: 'SOLVED' })

    await updateProgress(1, { status: 'SOLVED', confidence: 4 })

    expect(mockPrisma.progress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { problemId: 1 },
        create: expect.objectContaining({ problemId: 1, status: 'SOLVED', confidence: 4 }),
        update: expect.objectContaining({ status: 'SOLVED', confidence: 4 }),
      })
    )
  })

  it('sets solvedAt when status is SOLVED', async () => {
    mockPrisma.progress.upsert.mockResolvedValue({
      id: 1,
      problemId: 1,
      status: 'SOLVED',
      solvedAt: new Date(),
    })

    await updateProgress(1, { status: 'SOLVED' })

    const callArgs = mockPrisma.progress.upsert.mock.calls[0][0]
    expect(callArgs.create.solvedAt).toBeDefined()
    expect(callArgs.update.solvedAt).toBeDefined()
  })

  it('does not set solvedAt for non-SOLVED status', async () => {
    mockPrisma.progress.upsert.mockResolvedValue({ id: 1, problemId: 1, status: 'ATTEMPTED' })

    await updateProgress(1, { status: 'ATTEMPTED' })

    const callArgs = mockPrisma.progress.upsert.mock.calls[0][0]
    expect(callArgs.create.solvedAt).toBeUndefined()
    expect(callArgs.update.solvedAt).toBeUndefined()
  })

  it('calls revalidatePath after update', async () => {
    mockPrisma.progress.upsert.mockResolvedValue({ id: 1, problemId: 1, status: 'SOLVED' })

    await updateProgress(1, { status: 'SOLVED' })

    expect(revalidatePath).toHaveBeenCalled()
  })
})

describe('getProgressByTopic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns progress records for a topic', async () => {
    const mockData = [
      { id: 1, problemId: 1, status: 'SOLVED', problem: { topicId: 'arrays-hashing' } },
    ]
    mockPrisma.progress.findMany.mockResolvedValue(mockData)

    const result = await getProgressByTopic('arrays-hashing')

    expect(result).toEqual(mockData)
    expect(mockPrisma.progress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          problem: expect.objectContaining({ topicId: 'arrays-hashing' }),
        }),
      })
    )
  })
})
