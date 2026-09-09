import { useQuery } from '@tanstack/react-query'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TaskType } from '@/types'

const COLORS: Record<TaskType, string> = {
  Development: '#2563eb',
  Testing: '#0d9488',
  Meetings: '#d97706',
  Documentation: '#7c3aed',
  CodeReview: '#db2777',
  Support: '#ea580c',
  Training: '#65a30d',
  Other: '#64748b',
}

export function TimeByTaskTypeChart({
  weekStartDate,
  weekEndDate,
  userId,
}: {
  weekStartDate: string
  weekEndDate: string
  userId: string
}) {
  const scopedUserId = userId === 'all' ? undefined : userId
  const filters = { weekStartDate, weekEndDate, userId: scopedUserId }
  const timeQuery = useQuery({
    queryKey: queryKeys.dashboard.timeByTaskType(filters),
    queryFn: () => dashboardApi.timeByTaskType(filters),
  })

  const data = (timeQuery.data ?? [])
    .filter((t) => t.totalHours > 0)
    .map((t) => ({ name: t.taskType, value: t.totalHours }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time spent by task type</CardTitle>
      </CardHeader>
      <CardContent>
        {timeQuery.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No hours logged for this period.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={75} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as TaskType]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                  formatter={(value) => [`${value}h`, 'Hours']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
