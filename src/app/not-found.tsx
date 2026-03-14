import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
      <h2 className="text-4xl font-bold text-foreground">404</h2>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <p className="text-muted-foreground text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
