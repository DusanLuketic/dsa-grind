'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

import { updateProgress } from '@/lib/actions/progress'

interface NotesEditorProps {
  problemId: number
  initialNotes: string | null
}

export default function NotesEditor({ problemId, initialNotes }: NotesEditorProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your notes here...' }),
    ],
    content: initialNotes || '',
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      setSaveState('saving')
      debounceRef.current = setTimeout(() => {
        const html = instance.getHTML()
        startTransition(async () => {
          try {
            await updateProgress(problemId, { notes: html })
            setSaveState('saved')
            setTimeout(() => setSaveState('idle'), 2000)
          } catch {
            setSaveState('idle')
          }
        })
      }, 1500)
    },
  })

  if (!editor) {
    return <div className="h-40 animate-pulse rounded-md border border-border bg-card" />
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Notes</span>
        {saveState === 'saving' && <span className="text-xs text-muted-foreground">Saving...</span>}
        {saveState === 'saved' && <span className="text-xs text-green-500">Saved</span>}
      </div>

      <div className="flex gap-1 rounded-t-md border border-border bg-card p-1">
        {[
          {
            action: () => editor.chain().focus().toggleBold().run(),
            label: 'B',
            title: 'Bold',
            active: editor.isActive('bold'),
          },
          {
            action: () => editor.chain().focus().toggleItalic().run(),
            label: 'I',
            title: 'Italic',
            active: editor.isActive('italic'),
          },
          {
            action: () => editor.chain().focus().toggleCode().run(),
            label: '<>',
            title: 'Code',
            active: editor.isActive('code'),
          },
          {
            action: () => editor.chain().focus().toggleBulletList().run(),
            label: '•',
            title: 'Bullet List',
            active: editor.isActive('bulletList'),
          },
          {
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            label: 'H2',
            title: 'Heading',
            active: editor.isActive('heading', { level: 2 }),
          },
        ].map(({ action, label, title, active }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm min-h-[120px] max-w-none rounded-b-md border border-border border-t-0 bg-card p-3 text-foreground focus:outline-none"
      />
    </div>
  )
}
