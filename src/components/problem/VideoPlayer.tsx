'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface VideoPlayerProps {
  youtubeUrl: string
  title: string
}

function getVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/)
  return match ? match[1] : null
}

export default function VideoPlayer({ youtubeUrl, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false)
  const isDirectVideo = youtubeUrl.includes('watch?v=')
  const videoId = isDirectVideo ? getVideoId(youtubeUrl) : null

  if (hasError || !isDirectVideo || !videoId) {
    return (
      <div className="aspect-video rounded-lg bg-card border border-border flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">
          {hasError ? 'Video unavailable' : 'No direct video available'}
        </p>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Search on YouTube
        </a>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setHasError(true)}
      />
    </div>
  )
}
