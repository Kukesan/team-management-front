import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkloadByProjectChart({
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
  const workloadQuery = useQuery({
    queryKey: queryKeys.dashboard.workloadByProject(filters),
    queryFn: () => dashboardApi.workloadByProject(filters),
  })

  const data = (workloadQuery.data ?? []).map((w) => ({
    name: w.projectName,
    hours: w.totalHours,
    tasks: w.taskCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload by project</CardTitle>
      </CardHeader>
      <CardContent>
        {workloadQuery.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-400">No workload data for this period.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                  formatter={(value, name) => (name === 'hours' ? [`${value}h`, 'Hours'] : [value, 'Tasks'])}
                />
                <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
