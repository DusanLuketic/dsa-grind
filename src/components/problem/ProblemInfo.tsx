import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { getDifficultyColor, getProblemLinkLabel } from '@/lib/utils'

interface ProblemInfoProps {
  problem: {
    id: number
    title: string
    difficulty: string
    leetcodeUrl: string
    hints: string | null
    pattern: string | null
    topic: { title: string; slug: string }
  }
}

export default function ProblemInfo({ problem }: ProblemInfoProps) {
  return (
    <div className="space-y-4">
      {/* Title + Difficulty */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-2">{problem.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={getDifficultyColor(problem.difficulty)}
          >
            {problem.difficulty}
          </Badge>
          {problem.pattern && (
            <Badge variant="outline" className="text-xs">
              {problem.pattern}
            </Badge>
          )}
        </div>
      </div>

      {/* External Links */}
      <div className="flex flex-wrap gap-3">
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {getProblemLinkLabel(problem.leetcodeUrl)}
        </a>
        <a
          href={`https://www.youtube.com/results?search_query=neetcode+${encodeURIComponent(problem.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          NeetCode Search
        </a>
      </div>

      {/* Hints */}
      {problem.hints && (
        <details className="group">
          <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
            <span className="transition-transform group-open:rotate-90">&#9654;</span>
            Show Hints
          </summary>
          <div className="mt-2 p-3 bg-card border border-border rounded-md text-sm text-muted-foreground">
            {problem.hints}
          </div>
        </details>
      )}
    </div>
  )
}
