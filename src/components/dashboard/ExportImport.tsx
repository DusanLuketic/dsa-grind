'use client'

import { useState } from 'react'
import { showSuccess, showError } from '@/lib/toast'

export default function ExportImport() {
  const [isImporting, setIsImporting] = useState(false)

  async function handleExport() {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dsa-grind-export.json'
      a.click()
      URL.revokeObjectURL(url)
      showSuccess('Data exported!')
    } catch {
      showError('Export failed')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Import failed')
      const result = await response.json()
      showSuccess(`Imported: ${result.imported.progress} progress, ${result.imported.sessions} sessions`)
      // Reload to reflect changes
      window.location.reload()
    } catch {
      showError('Import failed — invalid file format')
    } finally {
      setIsImporting(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="px-3 py-1.5 text-xs rounded-md bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        Export JSON
      </button>
      <label className={`px-3 py-1.5 text-xs rounded-md bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
        {isImporting ? 'Importing...' : 'Import JSON'}
        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  )
}
