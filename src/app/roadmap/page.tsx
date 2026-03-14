import RoadmapFlow from '@/components/roadmap/RoadmapFlow'
import { prisma } from '@/lib/db'
import { getTopicsByProblemSet } from '@/lib/constants'

export const metadata = { title: 'Roadmap - DSA Grind' }

export default async function RoadmapPage() {
  const [progressCounts, topicCounts, allProblems] = await Promise.all([
    prisma.progress.groupBy({
      by: ['problemId'],
      where: { status: 'SOLVED' },
      _count: { id: true },
    }),
    prisma.problem.groupBy({
      by: ['topicId'],
      _count: { id: true },
    }),
    prisma.problem.findMany({
      select: { id: true, topicId: true },
    }),
  ])

  const problemToTopic = new Map(allProblems.map((problem) => [problem.id, problem.topicId]))
  const solvedByTopic: Record<string, number> = {}

  for (const progress of progressCounts) {
    const topicId = problemToTopic.get(progress.problemId)
    if (topicId) {
      solvedByTopic[topicId] = (solvedByTopic[topicId] ?? 0) + progress._count.id
    }
  }

  const totalByTopic: Record<string, number> = {}
  for (const topicCount of topicCounts) {
    totalByTopic[topicCount.topicId] = topicCount._count.id
  }

  const nc150Topics = getTopicsByProblemSet("neetcode-150")
  const topicProgress = nc150Topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    icon: topic.icon,
    color: topic.color,
    solved: solvedByTopic[topic.id] ?? 0,
    total: totalByTopic[topic.id] ?? 0,
  }))

  if (allProblems.length === 0 || topicProgress.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-2 text-2xl font-bold">Roadmap</h1>
        <p className="text-muted-foreground">Loading topics... Please run the seed script.</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Roadmap</h1>
        <p className="text-muted-foreground">Visual guide to the NeetCode 150 learning path</p>
      </div>
      <div className="overflow-x-auto">
        <RoadmapFlow topics={topicProgress} />
      </div>
    </div>
  )
}
