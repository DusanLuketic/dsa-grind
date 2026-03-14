import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getDifficultyColor } from '@/lib/utils'

interface RecommendedProblem {
  id: number
  title: string
  slug: string
  difficulty: string
  topicId: string
  topic: { title: string }
}

export default function RecommendedProblems({
  problems,
}: {
  problems: RecommendedProblem[]
}) {
  if (problems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-3">
          All problems solved! Amazing work!
        </p>
        <Link href="/roadmap" className="text-primary hover:underline text-sm">
          View Roadmap →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {problems.map((problem) => (
        <Link
          key={problem.id}
          href={`/problem/${problem.slug}`}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/30 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {problem.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {problem.topic.title}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`text-xs shrink-0 ${getDifficultyColor(problem.difficulty)}`}
          >
            {problem.difficulty}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
