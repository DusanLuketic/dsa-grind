import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

export interface Resource {
  id: number
  title: string
  url: string
  type: string
  source: string
  description: string | null
  topicId: string | null
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
            <Badge variant="secondary" className="mt-2 text-xs">
              {resource.source}
            </Badge>
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors shrink-0 mt-1"
          >
            Visit
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
