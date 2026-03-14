'use client'

import { useRef, useState, useTransition } from 'react'
import { Slider } from '@/components/ui/slider'
import { updateProgress } from '@/lib/actions/progress'
import { showError } from '@/lib/toast'

interface ConfidenceSliderProps {
  problemId: number
  initialConfidence: number | null
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'No idea',
  2: 'Struggling',
  3: 'Getting it',
  4: 'Confident',
  5: 'Mastered',
}

export default function ConfidenceSlider({
  problemId,
  initialConfidence,
}: ConfidenceSliderProps) {
  const [confidence, setConfidence] = useState(initialConfidence ?? 3)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(values: number[]) {
    const value = values[0] ?? confidence
    setConfidence(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await updateProgress(problemId, { confidence: value })
        } catch {
          showError('Failed to save confidence')
        }
      })
    }, 500)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Confidence</span>
        <span className="text-sm text-muted-foreground">
          {CONFIDENCE_LABELS[confidence] ?? ''}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={5}
        value={confidence}
        onChange={(e) => handleChange([Number(e.target.value)])}
        disabled={isPending}
        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}
