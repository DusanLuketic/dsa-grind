import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { TOPICS } from '@/lib/constants'

interface TopicProgress {
  topicId: string
  solved: number
  total: number
}

export default function ProgressOverview({
  topicProgress,
}: {
  topicProgress: TopicProgress[]
}) {
  const progressMap = new Map(topicProgress.map((p) => [p.topicId, p]))

  return (
    <div className="space-y-3">
      {TOPICS.map((topic) => {
        const progress = progressMap.get(topic.id)
        const solved = progress?.solved ?? 0
        const total = progress?.total ?? 0
        const percentage = total > 0 ? (solved / total) * 100 : 0

        return (
          <Link
            key={topic.id}
            href={`/topic/${topic.slug}`}
            className="flex items-center gap-3 group hover:bg-accent/30 rounded-md p-2 transition-colors"
          >
            <span className="text-lg shrink-0">{topic.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {topic.title}
                </span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {solved}/{total}
                </span>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
