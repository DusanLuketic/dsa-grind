export default function TopicLoading() {
  const skeletonRows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7', 'row-8']

  return (
    <div className="max-w-5xl space-y-4 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-2 w-full animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        {skeletonRows.map((row) => (
          <div key={row} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
