import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'

export function TasksTrendChart({ userId }: { userId: string }) {
  const scopedUserId = userId === 'all' ? undefined : userId
  const trendQuery = useQuery({
    queryKey: queryKeys.dashboard.trend({ userId: scopedUserId }),
    queryFn: () => dashboardApi.completionTrend({ userId: scopedUserId }, 8),
  })

  const data = (trendQuery.data ?? []).map((point) => ({
    week: formatDate(point.weekStartDate, 'MMM d'),
    completed: point.completedTaskCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks completed trend {userId === 'all' ? '(team-wide)' : '(selected member)'}</CardTitle>
      </CardHeader>
      <CardContent>
        {trendQuery.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No trend data available yet.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                  formatter={(value) => [value, 'Tasks completed']}
                />
                <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
