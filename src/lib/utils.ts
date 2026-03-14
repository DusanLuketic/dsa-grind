import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case 'EASY': return 'text-green-500'
    case 'MEDIUM': return 'text-yellow-500'
    case 'HARD': return 'text-red-500'
    default: return 'text-muted-foreground'
  }
}
