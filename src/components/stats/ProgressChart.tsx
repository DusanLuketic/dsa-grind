'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ProgressChartProps {
  data: { date: string; solved: number }[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 18%)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'hsl(240 5% 65%)', fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
          tickLine={false}
        />
        <YAxis tick={{ fill: 'hsl(240 5% 65%)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(240 10% 6%)',
            border: '1px solid hsl(240 5% 18%)',
            borderRadius: '6px',
          }}
          labelStyle={{ color: 'hsl(0 0% 98%)' }}
          itemStyle={{ color: 'hsl(217.2 91.2% 59.8%)' }}
        />
        <Line
          type="monotone"
          dataKey="solved"
          stroke="hsl(217.2 91.2% 59.8%)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(217.2 91.2% 59.8%)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
