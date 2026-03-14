import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

interface TopicNodeProps {
  topic: {
    id: string
    title: string
    slug: string
    icon: string
    color: string
    solved: number
    total: number
  }
}

function getNodeColor(solved: number, total: number): string {
  if (total === 0 || solved === 0) return 'border-border bg-card'
  if (solved >= total) return 'border-green-500/70 bg-green-950/20'
  return 'border-yellow-500/70 bg-yellow-950/20'
}

export default function TopicNode({ topic }: TopicNodeProps) {
  const progressPercent = topic.total > 0 ? (topic.solved / topic.total) * 100 : 0
  const colorClass = getNodeColor(topic.solved, topic.total)

  return (
    <Link
      href={`/topic/${topic.slug}`}
      data-topic-id={topic.id}
      className={`block h-[104px] w-40 rounded-lg border-2 p-3 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/10 ${colorClass}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">{topic.icon}</span>
        <span className="text-xs font-semibold leading-tight text-foreground">{topic.title}</span>
      </div>
      <div className="space-y-1">
        <Progress value={progressPercent} className="h-1" />
        <p className="text-xs text-muted-foreground">{topic.solved}/{topic.total}</p>
      </div>
    </Link>
  )
}
