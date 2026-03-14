import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QuickStats from '@/components/dashboard/QuickStats'
import ProgressOverview from '@/components/dashboard/ProgressOverview'
import StreakTracker from '@/components/dashboard/StreakTracker'
import RecommendedProblems from '@/components/dashboard/RecommendedProblems'
import ExportImport from '@/components/dashboard/ExportImport'

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [totalSolved, progressData, allProblems, recentSessions] =
    await Promise.all([
      prisma.progress.count({ where: { status: 'SOLVED' } }),
      prisma.progress.findMany({
        where: { status: 'SOLVED' },
        include: { problem: { select: { topicId: true, difficulty: true, title: true, slug: true } } },
      }),
      prisma.problem.findMany({
        where: {
          NOT: { progress: { status: 'SOLVED' } },
        },
        include: { topic: { select: { title: true } } },
        orderBy: [{ topic: { order: 'asc' } }, { order: 'asc' }],
        take: 5,
      }),
      prisma.studySession.findMany({
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ])

  // Calculate stats
  const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 }
  for (const p of progressData) {
    const diff = p.problem.difficulty.toLowerCase()
    if (diff === 'easy') solvedByDifficulty.easy++
    else if (diff === 'medium') solvedByDifficulty.medium++
    else if (diff === 'hard') solvedByDifficulty.hard++
  }

  const stats = {
    totalSolved,
    solvedByDifficulty,
    averageTime: 0,
  }

  // Calculate streak
  const activityDates = new Set<string>()
  for (const p of progressData) {
    if (p.solvedAt) activityDates.add(p.solvedAt.toISOString().slice(0, 10))
  }
  for (const s of recentSessions) {
    activityDates.add(s.date.toISOString().slice(0, 10))
  }

  let currentStreak = 0
  const checkDate = new Date()
  while (activityDates.has(checkDate.toISOString().slice(0, 10))) {
    currentStreak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  const today = new Date().toISOString().slice(0, 10)
  const todaySolvedProblems = progressData
    .filter((p) => p.solvedAt?.toISOString().slice(0, 10) === today)
    .map((p) => ({ id: p.problemId, title: p.problem.title, slug: p.problem.slug }))

  // Calculate topic progress — manual aggregation (groupBy may not work with relation fields in v7 SQLite)
  const topicTotals: Record<string, number> = {}
  const solvedByTopic: Record<string, number> = {}

  // Get all problems to count totals per topic
  const allProblemsList = await prisma.problem.findMany({
    select: { topicId: true },
  })
  for (const p of allProblemsList) {
    topicTotals[p.topicId] = (topicTotals[p.topicId] ?? 0) + 1
  }
  for (const p of progressData) {
    solvedByTopic[p.problem.topicId] = (solvedByTopic[p.problem.topicId] ?? 0) + 1
  }

  const topicProgress = Object.entries(topicTotals).map(([topicId, total]) => ({
    topicId,
    solved: solvedByTopic[topicId] ?? 0,
    total,
  }))

  const recommendedProblems = allProblems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    topicId: p.topicId,
    topic: { title: p.topic.title },
  }))

  // Empty state
  if (totalSolved === 0 && allProblems.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Start solving problems to see your progress!
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your NeetCode 150 progress
          </p>
        </div>
        <ExportImport />
      </div>

      <QuickStats stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Topic Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressOverview topicProgress={topicProgress} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Study Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakTracker
                streakData={{
                  currentStreak,
                  totalActiveDays: activityDates.size,
                }}
                todaySolved={todaySolvedProblems}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Recommended Next</CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendedProblems problems={recommendedProblems} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
