import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getDifficultyColor } from '@/lib/utils'
import { STATUS_LABELS } from '@/lib/constants'

interface ReviewProblem {
  id: number
  title: string
  slug: string
  difficulty: string
  topicTitle: string
  confidence: number | null
  status: string
}

export default function ReviewList({ problems }: { problems: ReviewProblem[] }) {
  if (problems.length === 0) return null

  return (
    <div className="space-y-2">
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
            <p className="text-xs text-muted-foreground mt-0.5">{problem.topicTitle}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {STATUS_LABELS[problem.status as keyof typeof STATUS_LABELS] ?? problem.status}
            </span>
            {problem.confidence !== null && (
              <span className="text-xs text-muted-foreground">
                conf:{problem.confidence}/5
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
