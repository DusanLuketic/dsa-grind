import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import VideoPlayer from '@/components/problem/VideoPlayer'
import ProblemInfo from '@/components/problem/ProblemInfo'
import ProblemControls from '@/components/problem/ProblemControls'
import KeyboardNav from '@/components/problem/KeyboardNav'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProblemPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const { slug } = await params
  const problem = await prisma.problem.findUnique({ where: { slug } })
  if (!problem) return { title: 'Not Found' }
  return { title: `${problem.title} — DSA Grind` }
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params

  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      topic: { select: { title: true, slug: true } },
      progress: true,
    },
  })

  if (!problem) notFound()

  // Get prev/next problems in same topic
  const [prevProblem, nextProblem] = await Promise.all([
    prisma.problem.findFirst({
      where: { topicId: problem.topicId, order: { lt: problem.order } },
      orderBy: { order: 'desc' },
      select: { slug: true, title: true, order: true },
    }),
    prisma.problem.findFirst({
      where: { topicId: problem.topicId, order: { gt: problem.order } },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, order: true },
    }),
  ])

  return (
    <div className="p-4 lg:p-6 max-w-7xl">
      <KeyboardNav prevSlug={prevProblem?.slug ?? null} nextSlug={nextProblem?.slug ?? null} />
      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Video */}
        <div className="lg:w-[55%] xl:w-[60%]">
          <VideoPlayer youtubeUrl={problem.youtubeUrl} title={problem.title} />
        </div>

        {/* Right: Info + Controls */}
        <div className="lg:flex-1 space-y-4">
          <ProblemInfo
            problem={{
              id: problem.id,
              title: problem.title,
              difficulty: problem.difficulty,
              leetcodeUrl: problem.leetcodeUrl,
              hints: problem.hints,
              pattern: problem.pattern,
              topic: problem.topic,
            }}
          />

          <ProblemControls
            problemId={problem.id}
            initialStatus={problem.progress?.status ?? 'NOT_STARTED'}
            initialConfidence={problem.progress?.confidence ?? null}
            initialNotes={problem.progress?.notes ?? null}
          />
        </div>
      </div>

      {/* Prev/Next Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {prevProblem ? (
          <Link
            href={`/problem/${prevProblem.slug}`}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm truncate max-w-[200px]">{prevProblem.title}</span>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-xs text-muted-foreground">
          {problem.topic.title}
        </span>

        {nextProblem ? (
          <Link
            href={`/problem/${nextProblem.slug}`}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
          >
            <span className="text-sm truncate max-w-[200px]">{nextProblem.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
