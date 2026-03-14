'use client'

import { useTransition } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateProgress } from '@/lib/actions/progress'
import { showError, showSuccess } from '@/lib/toast'
import { useAppStore } from '@/store/useAppStore'

interface SaveTimeDialogProps {
  problemId: number
  elapsedMs: number
  onClose: () => void
}

export default function SaveTimeDialog({
  problemId,
  elapsedMs,
  onClose,
}: SaveTimeDialogProps) {
  const [isPending, startTransition] = useTransition()
  const resetTimer = useAppStore((state) => state.resetTimer)
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000))

  function handleSave() {
    startTransition(async () => {
      try {
        await updateProgress(problemId, { timeSpent: elapsedMinutes })
        resetTimer()
        showSuccess(`Saved ${elapsedMinutes}min time spent`)
        onClose()
      } catch {
        showError('Failed to save time spent')
      }
    })
  }

  function handleSkip() {
    resetTimer()
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Save time spent?</DialogTitle>
          <DialogDescription>
            Save {elapsedMinutes} minute{elapsedMinutes === 1 ? '' : 's'} as time spent on this
            problem?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 sm:justify-end">
          <Button onClick={handleSkip} type="button" variant="outline">
            Skip
          </Button>
          <Button disabled={isPending} onClick={handleSave} type="button">
            {isPending ? 'Saving...' : `Save ${elapsedMinutes}min`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
