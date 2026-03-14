'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DifficultyPieProps {
  data: { name: string; value: number; color: string }[]
}

export default function DifficultyPie({ data }: DifficultyPieProps) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(240 10% 6%)',
            border: '1px solid hsl(240 5% 18%)',
            borderRadius: '6px',
          }}
          itemStyle={{ color: 'hsl(0 0% 98%)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
