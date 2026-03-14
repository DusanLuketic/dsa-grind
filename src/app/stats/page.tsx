import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProgressChart from '@/components/stats/ProgressChart'
import ActivityHeatmap from '@/components/stats/ActivityHeatmap'
import DifficultyPie from '@/components/stats/DifficultyPie'
import ReviewList from '@/components/stats/ReviewList'
import Link from 'next/link'
import { DIFFICULTY_COLORS } from '@/lib/constants'

export const metadata = { title: 'Statistics — DSA Grind' }

export default async function StatsPage() {
  const [solvedProblems, allSessions, reviewProblems, difficultyStats] = await Promise.all([
    prisma.progress.findMany({
      where: { status: 'SOLVED', solvedAt: { not: null } },
      select: { solvedAt: true },
      orderBy: { solvedAt: 'asc' },
    }),
    prisma.studySession.findMany({
      select: { date: true },
      orderBy: { date: 'asc' },
    }),
    prisma.progress.findMany({
      where: {
        OR: [
          { confidence: { lt: 3 } },
          { status: 'ATTEMPTED' },
          { status: 'REVIEW' },
        ],
      },
      include: {
        problem: {
          select: { title: true, slug: true, difficulty: true, topic: { select: { title: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.$queryRaw<{ difficulty: string; count: bigint }[]>`
      SELECT p.difficulty, COUNT(pr.id) as count
      FROM Progress pr
      JOIN Problem p ON pr.problemId = p.id
      WHERE pr.status = 'SOLVED'
      GROUP BY p.difficulty
    `,
  ])

  if (solvedProblems.length === 0 && allSessions.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Statistics</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">No stats yet — solve your first problem!</p>
          <Link href="/roadmap" className="text-primary hover:underline">
            Start with the Roadmap &rarr;
          </Link>
        </div>
      </div>
    )
  }

  // Build cumulative progress data
  const progressByDay: Record<string, number> = {}
  for (const p of solvedProblems) {
    if (!p.solvedAt) continue
    const date = p.solvedAt.toISOString().slice(0, 10)
    progressByDay[date] = (progressByDay[date] ?? 0) + 1
  }
  const sortedDates = Object.keys(progressByDay).sort()
  const chartData = sortedDates.reduce<Array<{ date: string; solved: number }>>(
    (acc, date) => {
      const cumulative = (acc[acc.length - 1]?.solved ?? 0) + progressByDay[date]
      acc.push({ date, solved: cumulative })
      return acc
    },
    []
  )

  // Build activity data for heatmap
  const activityByDay: Record<string, number> = {}
  for (const p of solvedProblems) {
    if (!p.solvedAt) continue
    const date = p.solvedAt.toISOString().slice(0, 10)
    activityByDay[date] = (activityByDay[date] ?? 0) + 1
  }
  for (const s of allSessions) {
    const date = s.date.toISOString().slice(0, 10)
    activityByDay[date] = (activityByDay[date] ?? 0) + 1
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  const activityData: { date: string; count: number; level: number }[] = []
  const cur = new Date(startDate)
  while (cur <= endDate) {
    const dateStr = cur.toISOString().slice(0, 10)
    const count = activityByDay[dateStr] ?? 0
    activityData.push({
      date: dateStr,
      count,
      level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4,
    })
    cur.setDate(cur.getDate() + 1)
  }

  // Difficulty pie data
  const pieData = difficultyStats.map((row) => ({
    name: row.difficulty,
    value: Number(row.count),
    color: DIFFICULTY_COLORS[row.difficulty as keyof typeof DIFFICULTY_COLORS] ?? '#6b7280',
  }))

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Statistics</h1>
        <p className="text-muted-foreground">Your DSA learning progress over time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Cumulative Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">By Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DifficultyPie data={pieData} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={activityData} />
        </CardContent>
      </Card>

      {reviewProblems.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Review Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewList problems={reviewProblems.map((p) => ({
              id: p.problemId,
              title: p.problem.title,
              slug: p.problem.slug,
              difficulty: p.problem.difficulty,
              topicTitle: p.problem.topic.title,
              confidence: p.confidence,
              status: p.status,
            }))} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
