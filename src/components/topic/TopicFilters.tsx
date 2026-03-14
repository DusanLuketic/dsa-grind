'use client'

export interface FilterState {
  status: 'all' | 'not_started' | 'attempted' | 'solved' | 'review'
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
  sort: 'order' | 'difficulty' | 'status'
}

interface TopicFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const STATUS_OPTIONS = ['all', 'not_started', 'attempted', 'solved', 'review'] as const
const DIFFICULTY_OPTIONS = ['all', 'easy', 'medium', 'hard'] as const
const SORT_OPTIONS = [
  { value: 'order', label: 'Default' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'status', label: 'Status' },
] as const

export default function TopicFilters({ filters, onFilterChange }: TopicFiltersProps) {
  function update(key: keyof FilterState, value: string) {
    onFilterChange({ ...filters, [key]: value } as FilterState)
  }

  const capitalize = (s: string) =>
    s === 'not_started' ? 'Not Started' : s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="flex flex-wrap gap-4">
      {/* Status filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Status:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => update('status', opt)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              filters.status === opt
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {capitalize(opt)}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Difficulty:</span>
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => update('difficulty', opt)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              filters.difficulty === opt
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {capitalize(opt)}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => update('sort', opt.value)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              filters.sort === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
