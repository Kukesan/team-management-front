import { useQuery } from '@tanstack/react-query'
import { FileCheck2, Send } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatRelative } from '@/lib/format'

export function RecentActivityFeed() {
  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: dashboardApi.activity,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activityQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !activityQuery.data || activityQuery.data.length === 0 ? (
          <EmptyState title="No recent activity" description="Submissions and review actions will show up here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {activityQuery.data.map((item) => {
              const Icon = item.type === 'Submission' ? Send : FileCheck2
              return (
                <li key={item.id} className="flex items-start gap-3 py-2.5">
                  <span
                    className={
                      item.type === 'Submission'
                        ? 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600'
                        : 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{item.userName}</span> {item.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.projectName} · {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
