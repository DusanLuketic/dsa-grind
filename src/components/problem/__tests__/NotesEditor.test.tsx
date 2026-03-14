import { act, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/actions/progress', () => ({
  updateProgress: vi.fn().mockResolvedValue({}),
}))

const fakeEditor = {
  chain: () => fakeChain,
  isActive: () => false,
  getHTML: vi.fn(() => '<p>Updated notes</p>'),
}

const fakeChain = {
  focus: () => fakeChain,
  toggleBold: () => fakeChain,
  toggleItalic: () => fakeChain,
  toggleCode: () => fakeChain,
  toggleBulletList: () => fakeChain,
  toggleHeading: () => fakeChain,
  run: () => true,
}

let capturedOnUpdate:
  | ((payload: { editor: typeof fakeEditor }) => void)
  | undefined

vi.mock('@tiptap/react', () => ({
  EditorContent: ({ className }: { className?: string }) => (
    <div className={className} data-testid="notes-editor-content" />
  ),
  useEditor: (config: { onUpdate?: (payload: { editor: typeof fakeEditor }) => void }) => {
    capturedOnUpdate = config.onUpdate
    return fakeEditor
  },
}))

vi.mock('@tiptap/extension-placeholder', () => ({
  default: {
    configure: vi.fn(() => ({})),
  },
}))

vi.mock('@tiptap/starter-kit', () => ({
  default: {},
}))

import { updateProgress } from '@/lib/actions/progress'
import NotesEditor from '../NotesEditor'

describe('NotesEditor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    capturedOnUpdate = undefined
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('shows saving and saved indicators around debounced saves', async () => {
    render(<NotesEditor problemId={1} initialNotes="<p>Existing</p>" />)

    expect(capturedOnUpdate).toBeDefined()

    act(() => {
      capturedOnUpdate?.({ editor: fakeEditor })
    })

    expect(screen.getByText('Saving...')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
    })

    expect(updateProgress).toHaveBeenCalledWith(1, { notes: '<p>Updated notes</p>' })

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
