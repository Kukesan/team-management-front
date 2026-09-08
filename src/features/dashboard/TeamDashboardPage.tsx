import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { dashboardApi } from '@/api/dashboard'
import { reportsApi } from '@/api/reports'
import { usersApi } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { DashboardFiltersBar, type DashboardFilterState } from '@/features/dashboard/DashboardFiltersBar'
import { SubmissionStatusTracker } from '@/features/dashboard/SubmissionStatusTracker'
import { TeamReportsTable } from '@/features/dashboard/TeamReportsTable'
import { SectionCompareView } from '@/features/dashboard/SectionCompareView'
import type { ReportStatus } from '@/types'

function toReportListParams(f: DashboardFilterState) {
  return {
    weekStartDate: f.weekStartDate || undefined,
    weekEndDate: f.weekEndDate || undefined,
    userId: f.userId === 'all' ? undefined : f.userId,
    projectId: f.projectId === 'all' ? undefined : f.projectId,
    status: f.status === 'all' || f.status === 'NotStarted' ? undefined : (f.status as ReportStatus),
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

  const reportParams = useMemo(() => toReportListParams(filters), [filters])

  const usersQuery = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })
  const teamMembers = useMemo(() => usersQuery.data?.filter((u) => u.role === 'TeamMember') ?? [], [usersQuery.data])
  const visibleMembers = useMemo(
    () => (filters.userId === 'all' ? teamMembers : teamMembers.filter((m) => m.id === filters.userId)),
    [teamMembers, filters.userId],
  )

  // Submission status tracking is scoped to a single week (the range's start date), matching
  // the /dashboard/status-by-member endpoint's single-week contract.
  const statusByMemberQuery = useQuery({
    queryKey: queryKeys.dashboard.statusByMember({ weekStartDate: filters.weekStartDate }),
    queryFn: () => dashboardApi.statusByMember({ weekStartDate: filters.weekStartDate }),
  })

  const reportsQuery = useQuery({
    queryKey: queryKeys.reports.team(reportParams),
    queryFn: () => reportsApi.listTeam(reportParams),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Team Dashboard</h1>
        <p className="text-sm text-slate-500">Review your team's weekly reports and submission status.</p>
      </div>

      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <SubmissionStatusTracker
        members={visibleMembers}
        statusRows={statusByMemberQuery.data}
        isLoading={usersQuery.isLoading || statusByMemberQuery.isLoading}
        projectId={filters.projectId}
        statusFilter={filters.status}
      />

      <TeamReportsTable reports={reportsQuery.data} isLoading={reportsQuery.isLoading} />

      <SectionCompareView reports={reportsQuery.data} isLoading={reportsQuery.isLoading} />
    </div>
  )
}
