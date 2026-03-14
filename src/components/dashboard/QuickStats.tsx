import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DIFFICULTY_COLORS } from '@/lib/constants'

interface StatsData {
  totalSolved: number
  solvedByDifficulty: { easy: number; medium: number; hard: number }
  averageTime: number
}

export default function QuickStats({ stats }: { stats: StatsData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Total Solved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.totalSolved}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 150</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            By Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 text-sm">
            <span style={{ color: DIFFICULTY_COLORS.EASY }}>
              E:{stats.solvedByDifficulty.easy}
            </span>
            <span style={{ color: DIFFICULTY_COLORS.MEDIUM }}>
              M:{stats.solvedByDifficulty.medium}
            </span>
            <span style={{ color: DIFFICULTY_COLORS.HARD }}>
              H:{stats.solvedByDifficulty.hard}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Avg Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">
            {stats.averageTime > 0 ? `${Math.round(stats.averageTime)}m` : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per problem</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalSolved > 0
              ? `${Math.round((stats.totalSolved / 150) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {150 - stats.totalSolved} remaining
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
