export default function ProblemLoading() {
  return (
    <div className="flex gap-6 p-6">
      <div className="aspect-video flex-1 animate-pulse rounded bg-muted" />
      <div className="w-80 space-y-4">
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-40 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
