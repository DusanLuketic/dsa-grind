import { prisma } from '@/lib/db'
import { PROBLEM_SETS, getTopicsByProblemSet } from '@/lib/constants'
import ExportImport from '@/components/dashboard/ExportImport'
import DashboardClient, { type ProblemSetData } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  // Fetch all data once
  const [allProblems, allProgress, recentSessions] = await Promise.all([
    prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        topicId: true,
        order: true,
      },
    }),
    prisma.progress.findMany({
      where: { status: 'SOLVED' },
      include: {
        problem: {
          select: { topicId: true, difficulty: true, title: true, slug: true },
        },
      },
    }),
    prisma.studySession.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    }),
  ])

  // Get topic-to-problemSet mapping from constants
  const topicProblemSetMap = new Map<string, string>()
  for (const set of PROBLEM_SETS) {
    for (const topic of getTopicsByProblemSet(set.id)) {
      topicProblemSetMap.set(topic.id, set.id)
    }
  }

  // Group problems by problem set
  const problemsBySet = new Map<string, typeof allProblems>()
  const solvedBySet = new Map<string, typeof allProgress>()

  for (const problem of allProblems) {
    const setId = topicProblemSetMap.get(problem.topicId) ?? 'neetcode-150'
    const arr = problemsBySet.get(setId) ?? []
    arr.push(problem)
    problemsBySet.set(setId, arr)
  }

  for (const progress of allProgress) {
    const setId = topicProblemSetMap.get(progress.problem.topicId) ?? 'neetcode-150'
    const arr = solvedBySet.get(setId) ?? []
    arr.push(progress)
    solvedBySet.set(setId, arr)
  }

  // Build per-set data
  const problemSetsData: ProblemSetData[] = PROBLEM_SETS.map((set) => {
    const topics = getTopicsByProblemSet(set.id)
    const setProblems = problemsBySet.get(set.id) ?? []
    const setSolved = solvedBySet.get(set.id) ?? []

    // Stats
    const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 }
    for (const p of setSolved) {
      const diff = p.problem.difficulty.toLowerCase()
      if (diff === 'easy') solvedByDifficulty.easy++
      else if (diff === 'medium') solvedByDifficulty.medium++
      else if (diff === 'hard') solvedByDifficulty.hard++
    }

    // Topic progress
    const topicTotals: Record<string, number> = {}
    const topicSolved: Record<string, number> = {}
    for (const p of setProblems) {
      topicTotals[p.topicId] = (topicTotals[p.topicId] ?? 0) + 1
    }
    for (const p of setSolved) {
      topicSolved[p.problem.topicId] = (topicSolved[p.problem.topicId] ?? 0) + 1
    }
    const topicProgress = Object.entries(topicTotals).map(([topicId, total]) => ({
      topicId,
      solved: topicSolved[topicId] ?? 0,
      total,
    }))

    // Solved problem IDs for filtering recommendations
    const solvedProblemIds = new Set(setSolved.map((p) => p.problemId))

    // Recommended problems (unsolved, ordered by topic then order)
    const unsolved = setProblems
      .filter((p) => !solvedProblemIds.has(p.id))
      .sort((a, b) => {
        const topicA = topics.findIndex((t) => t.id === a.topicId)
        const topicB = topics.findIndex((t) => t.id === b.topicId)
        if (topicA !== topicB) return topicA - topicB
        return a.order - b.order
      })
      .slice(0, 5)

    const topicTitleMap = new Map(topics.map((t) => [t.id, t.title]))
    const recommendedProblems = unsolved.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      topicId: p.topicId,
      topic: { title: topicTitleMap.get(p.topicId) ?? '' },
    }))

    return {
      id: set.id,
      label: set.label,
      icon: set.icon,
      stats: {
        totalSolved: setSolved.length,
        solvedByDifficulty,
        averageTime: 0,
        totalProblems: setProblems.length,
      },
      topicProgress,
      topics: topics.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        icon: t.icon,
        color: t.color,
        category: t.category,
      })),
      recommendedProblems,
    }
  })

  // Global streak data
  const activityDates = new Set<string>()
  for (const p of allProgress) {
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
  const todaySolvedProblems = allProgress
    .filter((p) => p.solvedAt?.toISOString().slice(0, 10) === today)
    .map((p) => ({
      id: p.problemId,
      title: p.problem.title,
      slug: p.problem.slug,
    }))

  // Empty state
  const totalProblems = allProblems.length
  const totalSolved = allProgress.length

  if (totalSolved === 0 && totalProblems === 0) {
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
            Track your NeetCode progress
          </p>
        </div>
        <ExportImport />
      </div>

      <DashboardClient
        problemSets={problemSetsData}
        streakData={{
          currentStreak,
          totalActiveDays: activityDates.size,
        }}
        todaySolved={todaySolvedProblems}
      />
    </div>
  )
}
