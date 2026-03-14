'use client'

import { useRouter } from 'next/navigation'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface KeyboardNavProps {
  prevSlug: string | null
  nextSlug: string | null
}

export default function KeyboardNav({ prevSlug, nextSlug }: KeyboardNavProps) {
  const router = useRouter()

  useKeyboardShortcuts({
    onNext: nextSlug ? () => router.push(`/problem/${nextSlug}`) : undefined,
    onPrevious: prevSlug ? () => router.push(`/problem/${prevSlug}`) : undefined,
    onStatusToggle: () => {
      // Try to find and click the status selector button
      const statusBtn = document.querySelector('[data-status-selector]') as HTMLButtonElement | null
      statusBtn?.click()
    },
  })

  return null
}
