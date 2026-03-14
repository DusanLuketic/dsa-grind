'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db'

interface CreateSessionData {
  duration: number
  problemsSolved: number
  topicId?: string
  notes?: string
}

export async function createSession(data: CreateSessionData) {
  const result = await prisma.studySession.create({
    data,
  })

  revalidatePath('/')
  revalidatePath('/stats')
  revalidatePath('/session')

  return result
}

export async function getSessions(from?: Date, to?: Date) {
  return prisma.studySession.findMany({
    where:
      from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {},
    orderBy: { date: 'desc' },
  })
}
