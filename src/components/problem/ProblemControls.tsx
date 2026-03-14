'use client'

import { useCallback, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'

import ConfidenceSlider from './ConfidenceSlider'
import NotesEditor from './NotesEditor'
import ProblemTimer from './ProblemTimer'
import SaveTimeDialog from './SaveTimeDialog'
import StatusSelector from './StatusSelector'

interface ProblemControlsProps {
  problemId: number
  initialStatus: string
  initialConfidence: number | null
  initialNotes: string | null
}

export default function ProblemControls({
  problemId,
  initialStatus,
  initialConfidence,
  initialNotes,
}: ProblemControlsProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus || 'NOT_STARTED')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const getElapsed = useAppStore((state) => state.getElapsed)
  const timerProblemId = useAppStore((state) => state.timerState.problemId)

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      setCurrentStatus((prevStatus) => {
        if (newStatus === prevStatus) {
          return prevStatus
        }

        if (newStatus !== 'SOLVED') {
          setShowSaveDialog(false)
        }

        if (
          newStatus === 'SOLVED' &&
          prevStatus !== 'SOLVED' &&
          timerProblemId === problemId &&
          getElapsed() > 30000
        ) {
          setShowSaveDialog(true)
        }

        return newStatus
      })
    },
    [getElapsed, problemId, timerProblemId]
  )

  return (
    <div className="space-y-4">
      <StatusSelector
        problemId={problemId}
        initialStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />
      <Separator className="bg-border" />
      <ConfidenceSlider problemId={problemId} initialConfidence={initialConfidence} />
      <Separator className="bg-border" />
      <ProblemTimer problemId={problemId} />
      <Separator className="bg-border" />
      <NotesEditor problemId={problemId} initialNotes={initialNotes} />

      {showSaveDialog ? (
        <SaveTimeDialog
          problemId={problemId}
          elapsedMs={getElapsed()}
          onClose={() => setShowSaveDialog(false)}
        />
      ) : null}
    </div>
  )
}
