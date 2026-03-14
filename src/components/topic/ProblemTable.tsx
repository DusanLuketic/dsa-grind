'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { updateProgress } from '@/lib/actions/progress'
import { getDifficultyColor, getProblemLinkLabel } from '@/lib/utils'
import TopicFilters, { type FilterState } from './TopicFilters'
import { STATUS_LABELS } from '@/lib/constants'

interface Problem {
  id: number
  title: string
  slug: string
  difficulty: string
  leetcodeUrl: string
  youtubeUrl: string
  order: number
  pattern: string | null
  progress: { status: string; confidence: number | null } | null
}

const STATUS_ICONS: Record<string, string> = {
  NOT_STARTED: '\u2B55',
  ATTEMPTED: '\uD83D\uDD04',
  SOLVED: '\u2705',
  REVIEW: '\uD83D\uDD01',
}

const STATUS_CYCLE: Record<string, string> = {
  NOT_STARTED: 'ATTEMPTED',
  ATTEMPTED: 'SOLVED',
  SOLVED: 'REVIEW',
  REVIEW: 'NOT_STARTED',
}

function difficultyOrder(d: string) {
  return d === 'EASY' ? 0 : d === 'MEDIUM' ? 1 : 2
}

export default function ProblemTable({ problems }: { problems: Problem[] }) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    difficulty: 'all',
    sort: 'order',
  })
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<number, string>>({})
  const [, startTransition] = useTransition()

  function currentStatus(problem: Problem): string {
    return optimisticStatuses[problem.id] ?? problem.progress?.status ?? 'NOT_STARTED'
  }

  function handleStatusCycle(problemId: number, currentSt: string) {
    const next = STATUS_CYCLE[currentSt] ?? 'NOT_STARTED'
    setOptimisticStatuses((prev) => ({ ...prev, [problemId]: next }))
    startTransition(async () => {
      try {
        await updateProgress(problemId, { status: next })
      } catch {
        setOptimisticStatuses((prev) => {
          const copy = { ...prev }
          delete copy[problemId]
          return copy
        })
      }
    })
  }

  let filtered = problems.filter((p) => {
    if (filters.status !== 'all' && currentStatus(p).toLowerCase() !== filters.status) return false
    if (filters.difficulty !== 'all' && p.difficulty.toLowerCase() !== filters.difficulty)
      return false
    return true
  })

  filtered = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'difficulty':
        return difficultyOrder(a.difficulty) - difficultyOrder(b.difficulty)
      case 'status':
        return currentStatus(a).localeCompare(currentStatus(b))
      default:
        return a.order - b.order
    }
  })

  if (filtered.length === 0) {
    return (
      <div>
        <TopicFilters filters={filters} onFilterChange={setFilters} />
        <div className="text-center py-12 text-muted-foreground">
          No problems match the current filters
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopicFilters filters={filters} onFilterChange={setFilters} />
      <div className="mt-4 space-y-2">
        {filtered.map((problem) => {
          const status = currentStatus(problem)
          return (
            <div
              key={problem.id}
              className="flex items-center gap-3 p-3 rounded-md bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => handleStatusCycle(problem.id, status)}
                className="text-lg hover:scale-110 transition-transform shrink-0"
                title={`${STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status} — click to change`}
              >
                {STATUS_ICONS[status] ?? '\u2B55'}
              </button>

              <Link
                href={`/problem/${problem.slug}`}
                className="flex-1 min-w-0 font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                {problem.title}
              </Link>

              <Badge
                variant="secondary"
                className={`text-xs shrink-0 ${getDifficultyColor(problem.difficulty)}`}
              >
                {problem.difficulty}
              </Badge>

              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={getProblemLinkLabel(problem.leetcodeUrl)}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
