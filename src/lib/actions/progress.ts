'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db'

const VALID_STATUSES = ['NOT_STARTED', 'ATTEMPTED', 'SOLVED', 'REVIEW'] as const

interface UpdateProgressData {
  status?: string
  notes?: string
  confidence?: number | null
  timeSpent?: number | null
}

export async function updateProgress(problemId: number, data: UpdateProgressData) {
  // Validate inputs
  if (!Number.isInteger(problemId) || problemId <= 0) {
    throw new Error('Invalid problemId')
  }
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status as typeof VALID_STATUSES[number])) {
    throw new Error(`Invalid status: ${data.status}`)
  }
  if (data.confidence !== undefined && data.confidence !== null) {
    if (!Number.isInteger(data.confidence) || data.confidence < 1 || data.confidence > 5) {
      throw new Error('Confidence must be between 1 and 5')
    }
  }

  const progressData = {
    ...data,
    // solvedAt records when first solved — preserved even if status changes later
    ...(data.status === 'SOLVED' ? { solvedAt: new Date() } : {}),
  }

  const result = await prisma.progress.upsert({
    where: { problemId },
    create: {
      problemId,
      ...progressData,
    },
    update: progressData,
  })

  revalidatePath('/')
  revalidatePath('/problem')
  revalidatePath('/topic')

  return result
}

export async function getProgressByTopic(topicId: string) {
  return prisma.progress.findMany({
    where: {
      problem: {
        topicId,
      },
    },
    include: {
      problem: true,
    },
  })
}
