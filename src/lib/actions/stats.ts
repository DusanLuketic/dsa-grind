'use server'

import { prisma } from '@/lib/db'

type DifficultyCountRow = {
  difficulty: string
  count: number
}

type ActivityPoint = {
  date: string
  count: number
  level: number
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function activityLevel(count: number) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

export async function getStats() {
  const [totalSolved, timeStats, byDifficulty] = await Promise.all([
    prisma.progress.count({ where: { status: 'SOLVED' } }),
    prisma.progress.aggregate({
      where: { timeSpent: { not: null } },
      _avg: { timeSpent: true },
    }),
    prisma.$queryRaw<DifficultyCountRow[]>`
      SELECT p.difficulty, COUNT(pr.id) as count
      FROM Progress pr
      JOIN Problem p ON pr.problemId = p.id
      WHERE pr.status = 'SOLVED'
      GROUP BY p.difficulty
    `,
  ])

  const solvedByDifficulty = {
    easy: 0,
    medium: 0,
    hard: 0,
  }

  for (const row of byDifficulty) {
    const difficulty = row.difficulty.toUpperCase()

    if (difficulty === 'EASY') solvedByDifficulty.easy = Number(row.count)
    if (difficulty === 'MEDIUM') solvedByDifficulty.medium = Number(row.count)
    if (difficulty === 'HARD') solvedByDifficulty.hard = Number(row.count)
  }

  return {
    totalSolved,
    solvedByDifficulty,
    averageTime: timeStats._avg.timeSpent ?? 0,
  }
}

export async function getStreakData() {
  const [solvedDates, sessionDates] = await Promise.all([
    prisma.progress.findMany({
      where: { solvedAt: { not: null } },
      select: { solvedAt: true },
    }),
    prisma.studySession.findMany({
      select: { date: true },
    }),
  ])

  const activityDates = new Set<string>()

  for (const entry of solvedDates) {
    if (entry.solvedAt) {
      activityDates.add(toDateKey(entry.solvedAt))
    }
  }

  for (const entry of sessionDates) {
    activityDates.add(toDateKey(entry.date))
  }

  let currentStreak = 0
  const cursor = new Date()

  while (activityDates.has(toDateKey(cursor))) {
    currentStreak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    currentStreak,
    totalActiveDays: activityDates.size,
    activityDates: Array.from(activityDates).sort(),
  }
}

export async function getActivityData() {
  const [solvedDates, sessionDates] = await Promise.all([
    prisma.progress.findMany({
      where: { solvedAt: { not: null } },
      select: { solvedAt: true },
    }),
    prisma.studySession.findMany({
      select: { date: true },
    }),
  ])

  const countByDate = new Map<string, number>()

  for (const entry of solvedDates) {
    if (entry.solvedAt) {
      const dateKey = toDateKey(entry.solvedAt)
      countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1)
    }
  }

  for (const entry of sessionDates) {
    const dateKey = toDateKey(entry.date)
    countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1)
  }

  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setFullYear(startDate.getFullYear() - 1)

  const result: ActivityPoint[] = []
  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const date = toDateKey(cursor)
    const count = countByDate.get(date) ?? 0

    result.push({
      date,
      count,
      level: activityLevel(count),
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}
