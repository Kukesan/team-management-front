import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { TimeByTaskType } from '@/types'

const COLORS: Record<string, string> = {
  Development: '#2563eb',
  Testing: '#0d9488',
  Meetings: '#d97706',
  Documentation: '#7c3aed',
}

export function TimeByTaskTypeChart({ data, isLoading }: { data?: TimeByTaskType[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time spent by task type</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No data" description="No hours logged for the selected filters." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="taskType" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                  formatter={(value) => [`${value}h`, 'Hours']}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.taskType} fill={COLORS[entry.taskType]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
