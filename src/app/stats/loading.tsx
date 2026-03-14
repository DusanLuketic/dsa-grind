export default function StatsLoading() {
  return (
    <div className="max-w-5xl space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded bg-muted lg:col-span-2" />
        <div className="h-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-40 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}
