import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { usersApi } from '@/api/users'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { InsightsFiltersBar, type InsightsFilterState } from '@/features/insights/InsightsFiltersBar'
import { SummaryMetricCards } from '@/features/insights/SummaryMetricCards'
import { SubmissionComplianceChart } from '@/features/insights/SubmissionComplianceChart'
import { StatusByMemberChart } from '@/features/insights/StatusByMemberChart'
import { TasksTrendChart } from '@/features/insights/TasksTrendChart'
import { WorkloadByProjectChart } from '@/features/insights/WorkloadByProjectChart'
import { TimeByTaskTypeChart } from '@/features/insights/TimeByTaskTypeChart'
import { RecentActivityFeed } from '@/features/insights/RecentActivityFeed'

export function InsightsDashboardPage() {
  const [filters, setFilters] = useState<InsightsFilterState>(() => ({
    weekStartDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    weekEndDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    userId: 'all',
  }))

  const usersQuery = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })
  const teamMembers = useMemo(() => usersQuery.data?.filter((u) => u.role === 'TeamMember') ?? [], [usersQuery.data])

  const statusByMemberQuery = useQuery({
    queryKey: queryKeys.dashboard.statusByMember({ weekStartDate: filters.weekStartDate }),
    queryFn: () => dashboardApi.statusByMember({ weekStartDate: filters.weekStartDate }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Insights</h1>
        <p className="text-sm text-slate-500">A data-driven overview of your team's weekly reporting activity.</p>
      </div>

      <InsightsFiltersBar filters={filters} onChange={setFilters} />

      <SummaryMetricCards weekStartDate={filters.weekStartDate} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubmissionComplianceChart
          members={teamMembers}
          statusRows={statusByMemberQuery.data}
          weekEndDate={filters.weekEndDate}
          isLoading={usersQuery.isLoading || statusByMemberQuery.isLoading}
        />
        <StatusByMemberChart
          members={teamMembers}
          statusRows={statusByMemberQuery.data}
          isLoading={usersQuery.isLoading || statusByMemberQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TasksTrendChart userId={filters.userId} />
        <WorkloadByProjectChart
          weekStartDate={filters.weekStartDate}
          weekEndDate={filters.weekEndDate}
          userId={filters.userId}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TimeByTaskTypeChart
          weekStartDate={filters.weekStartDate}
          weekEndDate={filters.weekEndDate}
          userId={filters.userId}
        />
        <RecentActivityFeed />
      </div>
    </div>
  )
}
