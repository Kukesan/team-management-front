import { useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatDate } from '@/lib/format'
import type { TrendPoint } from '@/types'

const LINE_COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#65a30d']

export function TrendChart({ data, isLoading }: { data?: TrendPoint[]; isLoading: boolean }) {
  const [mode, setMode] = useState<'team' | 'person'>('team')

  const { chartData, series } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], series: [] as string[] }

    if (mode === 'team') {
      const byWeek = new Map<string, number>()
      data.forEach((p) => byWeek.set(p.weekStartDate, (byWeek.get(p.weekStartDate) ?? 0) + p.tasksCompleted))
      const chartData = Array.from(byWeek.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStartDate, tasksCompleted]) => ({ week: formatDate(weekStartDate, 'MMM d'), team: tasksCompleted }))
      return { chartData, series: ['team'] }
    }

    const weeks = Array.from(new Set(data.map((p) => p.weekStartDate))).sort()
    const people = Array.from(new Set(data.map((p) => p.userName ?? 'Unknown')))
    const chartData = weeks.map((week) => {
      const row: Record<string, string | number> = { week: formatDate(week, 'MMM d') }
      people.forEach((name) => {
        row[name] = data.find((p) => p.weekStartDate === week && (p.userName ?? 'Unknown') === name)?.tasksCompleted ?? 0
      })
      return row
    })
    return { chartData, series: people }
  }, [data, mode])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Tasks completed trend</CardTitle>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'team' | 'person')}>
          <TabsList>
            <TabsTrigger value="team">Team-wide</TabsTrigger>
            <TabsTrigger value="person">Per-person</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <EmptyState title="No trend data" description="No completed tasks in this range yet." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                {series.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key === 'team' ? 'Team' : key}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
