import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const [progress, sessions] = await Promise.all([
    prisma.progress.findMany({
      include: {
        problem: {
          select: { slug: true, title: true },
        },
      },
    }),
    prisma.studySession.findMany({
      orderBy: { date: 'asc' },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: 1,
    progress: progress.map((p) => ({
      problemId: p.problemId,
      problemSlug: p.problem.slug,
      status: p.status,
      solvedAt: p.solvedAt,
      notes: p.notes,
      timeSpent: p.timeSpent,
      revisitCount: p.revisitCount,
      confidence: p.confidence,
    })),
    sessions: sessions.map((s) => ({
      date: s.date,
      duration: s.duration,
      problemsSolved: s.problemsSolved,
      topicId: s.topicId,
      notes: s.notes,
    })),
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': 'attachment; filename="dsa-grind-export.json"',
    },
  })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !Array.isArray((body as { progress?: unknown }).progress) ||
    !Array.isArray((body as { sessions?: unknown }).sessions)
  ) {
    return NextResponse.json(
      { error: 'Invalid format: expected { progress: [], sessions: [] }' },
      { status: 400 }
    )
  }

  const data = body as {
    progress: Array<{
      problemId: number
      status?: string
      solvedAt?: string | null
      notes?: string | null
      timeSpent?: number | null
      revisitCount?: number
      confidence?: number | null
    }>
    sessions: Array<{
      date: string
      duration: number
      problemsSolved: number
      topicId?: string | null
      notes?: string | null
    }>
  }

  // Upsert progress records
  let importedProgress = 0
  for (const p of data.progress) {
    try {
      await prisma.progress.upsert({
        where: { problemId: p.problemId },
        create: {
          problemId: p.problemId,
          status: p.status ?? 'NOT_STARTED',
          solvedAt: p.solvedAt ? new Date(p.solvedAt) : null,
          notes: p.notes ?? null,
          timeSpent: p.timeSpent ?? null,
          revisitCount: p.revisitCount ?? 0,
          confidence: p.confidence ?? null,
        },
        update: {
          status: p.status ?? 'NOT_STARTED',
          solvedAt: p.solvedAt ? new Date(p.solvedAt) : null,
          notes: p.notes ?? null,
          timeSpent: p.timeSpent ?? null,
          revisitCount: p.revisitCount ?? 0,
          confidence: p.confidence ?? null,
        },
      })
      importedProgress++
    } catch {
      // Intentional: individual record import failures are silently skipped
      // to allow bulk import to continue despite bad data
    }
  }

  // Create sessions (skip duplicates by date+duration)
  let importedSessions = 0
  for (const s of data.sessions) {
    try {
      const existing = await prisma.studySession.findFirst({
        where: {
          date: new Date(s.date),
          duration: s.duration,
        },
      })
      if (!existing) {
        await prisma.studySession.create({
          data: {
            date: new Date(s.date),
            duration: s.duration,
            problemsSolved: s.problemsSolved,
            topicId: s.topicId ?? null,
            notes: s.notes ?? null,
          },
        })
        importedSessions++
      }
    } catch {
      // Intentional: individual record import failures are silently skipped
      // to allow bulk import to continue despite bad data
    }
  }

  revalidatePath('/')
  revalidatePath('/stats')

  return NextResponse.json({
    imported: { progress: importedProgress, sessions: importedSessions },
  })
}
