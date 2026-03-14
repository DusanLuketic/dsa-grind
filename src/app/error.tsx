'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
      <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={reset} variant="default">
        Try Again
      </Button>
    </div>
  )
}
