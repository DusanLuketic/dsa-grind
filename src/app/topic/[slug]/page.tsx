import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Progress } from '@/components/ui/progress'
import ProblemTable from '@/components/topic/ProblemTable'

interface TopicPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { slug } = await params
  const topic = await prisma.topic.findUnique({ where: { slug } })
  if (!topic) return { title: 'Not Found' }
  return { title: `${topic.title} — DSA Grind` }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      problems: {
        orderBy: { order: 'asc' },
        include: {
          progress: true,
        },
      },
    },
  })

  if (!topic) notFound()

  const totalProblems = topic.problems.length
  const solvedProblems = topic.problems.filter(
    (p) => p.progress?.status === 'SOLVED'
  ).length
  const progressPercent = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0

  if (totalProblems === 0) {
    return (
      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">{topic.icon}</span>
            <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
          </div>
          {topic.description && (
            <p className="mb-4 text-muted-foreground">{topic.description}</p>
          )}
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="shrink-0 text-sm text-muted-foreground">
              {solvedProblems}/{totalProblems} solved
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
          No problems are available for this topic yet.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{topic.icon}</span>
          <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
        </div>
        {topic.description && (
          <p className="text-muted-foreground mb-4">{topic.description}</p>
        )}
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground shrink-0">
            {solvedProblems}/{totalProblems} solved
          </span>
        </div>
      </div>

      {/* Problem Table */}
      <ProblemTable
        problems={topic.problems.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          leetcodeUrl: p.leetcodeUrl,
          youtubeUrl: p.youtubeUrl,
          order: p.order,
          pattern: p.pattern,
          progress: p.progress
            ? {
                status: p.progress.status,
                confidence: p.progress.confidence,
              }
            : null,
        }))}
      />
    </div>
  )
}
