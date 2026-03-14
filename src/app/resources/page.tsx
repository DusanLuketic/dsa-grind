import { prisma } from '@/lib/db'
import { ResourceCard, type Resource } from './ResourceCard'

const TYPE_LABELS: Record<string, string> = {
  VIDEO: 'YouTube Channels',
  COURSE: 'Courses',
  TOOL: 'Tools',
  ARTICLE: 'Books & Articles',
}

const TYPE_ORDER = ['VIDEO', 'COURSE', 'TOOL', 'ARTICLE']

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ type: 'asc' }, { id: 'asc' }],
  })

  if (resources.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Resources</h1>
        <p className="text-muted-foreground">No resources available yet.</p>
      </div>
    )
  }

  // Group by type
  const grouped = resources.reduce<Record<string, Resource[]>>((acc, resource) => {
    const type = resource.type
    if (!acc[type]) acc[type] = []
    acc[type].push(resource)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1 text-foreground">Resources</h1>
      <p className="text-muted-foreground mb-8">
        Curated learning materials for mastering DSA
      </p>

      <div className="space-y-10">
        {TYPE_ORDER.filter((type) => grouped[type]?.length > 0).map((type) => (
          <section key={type}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {TYPE_LABELS[type] ?? type}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {grouped[type].map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
