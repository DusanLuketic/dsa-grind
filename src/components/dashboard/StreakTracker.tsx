import { Flame } from 'lucide-react'

interface StreakData {
  currentStreak: number
  totalActiveDays: number
}

interface TodaySolved {
  id: number
  title: string
  slug: string
}

export default function StreakTracker({
  streakData,
  todaySolved,
}: {
  streakData: StreakData
  todaySolved: TodaySolved[]
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-3xl font-bold text-foreground">
            {streakData.currentStreak}
          </span>
          <span className="text-muted-foreground">day streak</span>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {streakData.totalActiveDays} total active days
        </span>
      </div>

      {todaySolved.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Today&apos;s solved:
          </p>
          <ul className="space-y-1">
            {todaySolved.map((p) => (
              <li key={p.id} className="text-sm text-foreground">
                ✓ {p.title}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No problems solved today yet
        </p>
      )}
    </div>
  )
}
