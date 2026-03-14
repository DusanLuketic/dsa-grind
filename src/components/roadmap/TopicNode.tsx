import Link from 'next/link'

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

export default function TopicNode({ topic }: TopicNodeProps) {
  const progressPercent = topic.total > 0 ? (topic.solved / topic.total) * 100 : 0

  return (
    <Link
      href={`/topic/${topic.slug}`}
      data-topic-id={topic.id}
      className="flex h-[56px] w-[180px] flex-col items-center justify-center rounded-lg bg-indigo-700 px-3 py-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
    >
      <span className="text-[13px] font-semibold leading-tight text-white">{topic.title}</span>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-indigo-900/60">
        <div
          className="h-full rounded-full bg-indigo-300 transition-all"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </Link>
  )
}
