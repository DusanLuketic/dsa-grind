export default function GlobalLoading() {
  const skeletonCards = ['card-1', 'card-2', 'card-3', 'card-4']

  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {skeletonCards.map((card) => (
          <div key={card} className="h-24 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
