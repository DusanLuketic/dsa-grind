'use client'

interface ActivityData {
  date: string
  count: number
  level: number
}

const LEVEL_COLORS = [
  'hsl(240 5% 15%)',  // level 0 — muted/secondary bg
  'hsl(160 84% 18%)', // level 1 — dark green
  'hsl(160 84% 30%)', // level 2 — medium green
  'hsl(160 84% 42%)', // level 3 — bright green
  'hsl(152 76% 56%)', // level 4 — vivid green
]

export default function ActivityHeatmap({ data }: { data: ActivityData[] }) {
  if (data.length === 0) {
    return <div className="text-muted-foreground text-sm py-4">No activity data</div>
  }

  const recentData = data.slice(-364)

  const firstDate = new Date(recentData[0]?.date || new Date().toISOString())
  const dayOfWeek = firstDate.getDay()
  const paddedData: (ActivityData | null)[] = [
    ...Array(dayOfWeek).fill(null),
    ...recentData,
  ]

  const CELL = 12
  const GAP = 2

  // Flatten into positioned cells with stable keys
  const cells: { key: string; x: number; y: number; day: ActivityData | null }[] = []
  let col = 0
  for (let i = 0; i < paddedData.length; i += 7) {
    const week = paddedData.slice(i, i + 7)
    for (let row = 0; row < week.length; row++) {
      const day = week[row]
      cells.push({
        key: day ? day.date : `pad-${col}-${row}`,
        x: col * (CELL + GAP),
        y: row * (CELL + GAP) + 20,
        day,
      })
    }
    col++
  }

  const totalWidth = col * (CELL + GAP)

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={7 * (CELL + GAP) + 20}
        className="text-muted-foreground"
        role="img"
        aria-label="Activity heatmap showing daily coding activity over the past year"
      >
        <title>Activity Heatmap</title>
        {cells.map((cell) => (
          <g key={cell.key} aria-label={cell.day ? `${cell.day.date}: ${cell.day.count} activities` : undefined}>
            <rect
              x={cell.x}
              y={cell.y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={cell.day ? (LEVEL_COLORS[cell.day.level] ?? LEVEL_COLORS[0]) : 'transparent'}
              opacity={cell.day ? 0.9 : 1}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
