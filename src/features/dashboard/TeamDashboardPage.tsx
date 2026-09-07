import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { DashboardFiltersBar, type DashboardFilterState } from '@/features/dashboard/DashboardFiltersBar'
import { SummaryCards } from '@/features/dashboard/SummaryCards'
import { TrendChart } from '@/features/dashboard/TrendChart'
import { StatusByMemberChart } from '@/features/dashboard/StatusByMemberChart'
import { WorkloadChart } from '@/features/dashboard/WorkloadChart'
import { TimeByTaskTypeChart } from '@/features/dashboard/TimeByTaskTypeChart'
import { ActivityFeed } from '@/features/dashboard/ActivityFeed'
import { TeamMembersCard } from '@/features/dashboard/TeamMembersCard'

function toApiFilters(f: DashboardFilterState) {
  return {
    weekStartDate: f.weekStartDate || undefined,
    weekEndDate: f.weekEndDate || undefined,
    userId: f.userId === 'all' ? undefined : f.userId,
    projectId: f.projectId === 'all' ? undefined : f.projectId,
    status: f.status === 'all' ? undefined : f.status,
  }
}

export function TeamDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterState>(() => ({
    weekStartDate: format(startOfWeek(subWeeks(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    weekEndDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    userId: 'all',
    projectId: 'all',
    status: 'all',
  }))

  const apiFilters = useMemo(() => toApiFilters(filters), [filters])

  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary(apiFilters),
    queryFn: () => dashboardApi.summary(apiFilters),
  })
  const trendQuery = useQuery({
    queryKey: queryKeys.dashboard.trend(apiFilters),
    queryFn: () => dashboardApi.completionTrend(apiFilters),
  })
  const statusQuery = useQuery({
    queryKey: queryKeys.dashboard.statusByMember(apiFilters),
    queryFn: () => dashboardApi.statusByMember(apiFilters),
  })
  const workloadQuery = useQuery({
    queryKey: queryKeys.dashboard.workloadByProject(apiFilters),
    queryFn: () => dashboardApi.workloadByProject(apiFilters),
  })
  const timeByTypeQuery = useQuery({
    queryKey: queryKeys.dashboard.timeByTaskType(apiFilters),
    queryFn: () => dashboardApi.timeByTaskType(apiFilters),
  })
  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.activity(apiFilters),
    queryFn: () => dashboardApi.activity(apiFilters),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Team Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your team's weekly reporting.</p>
      </div>

      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <SummaryCards summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TrendChart data={trendQuery.data} isLoading={trendQuery.isLoading} />
        <StatusByMemberChart data={statusQuery.data} isLoading={statusQuery.isLoading} />
        <WorkloadChart data={workloadQuery.data} isLoading={workloadQuery.isLoading} />
        <TimeByTaskTypeChart data={timeByTypeQuery.data} isLoading={timeByTypeQuery.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TeamMembersCard data={statusQuery.data} isLoading={statusQuery.isLoading} />
        <ActivityFeed items={activityQuery.data} isLoading={activityQuery.isLoading} />
      </div>
    </div>
  )
}
