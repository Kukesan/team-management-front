import { http } from '@/lib/http'
import type {
  ActivityFeedItemResponse,
  ActivityItem,
  DashboardSummary,
  PagedResult,
  StatusByMemberResponse,
  TimeByTaskType,
  TrendPoint,
  WorkloadByProject,
} from '@/types'

export interface DashboardFilters {
  weekStartDate?: string
  weekEndDate?: string
  userId?: string
}

function mapActivityItem(dto: ActivityFeedItemResponse): ActivityItem {
  return {
    id: `${dto.reportId}-${dto.timestamp}`,
    type: dto.type,
    userName: dto.actorFullName,
    projectName: dto.projectName,
    message: dto.detail ?? (dto.type === 'Submission' ? 'submitted a report' : 'reviewed a report'),
    createdAt: dto.timestamp,
  }
}

export const dashboardApi = {
  // ASSUMPTION: /dashboard/summary and /dashboard/status-by-member take a single `week`
  // date, not a weekStartDate/weekEndDate range — the filter bar's end date is unused here.
  summary: (filters?: DashboardFilters) =>
    http
      .get<DashboardSummary>('/dashboard/summary', { params: { week: filters?.weekStartDate } })
      .then((r) => r.data),

  // ASSUMPTION: tasks-trend takes an optional UserId (single-user scope) and a Weeks count,
  // not a date range — there's no multi-series-per-user response, so no "per-person" view.
  completionTrend: (filters?: DashboardFilters, weeks = 8) =>
    http
      .get<TrendPoint[]>('/dashboard/tasks-trend', { params: { userId: filters?.userId, weeks } })
      .then((r) => r.data),

  // Returns the raw per-member/per-project rows for the week (not pre-aggregated), so callers
  // can filter by project and derive per-status counts / "not started" themselves.
  statusByMember: (filters?: DashboardFilters) =>
    http
      .get<StatusByMemberResponse[]>('/dashboard/status-by-member', { params: { week: filters?.weekStartDate } })
      .then((r) => r.data),

  workloadByProject: (filters?: DashboardFilters) =>
    http
      .get<WorkloadByProject[]>('/dashboard/workload-by-project', {
        params: { weekStartDate: filters?.weekStartDate, weekEndDate: filters?.weekEndDate, userId: filters?.userId },
      })
      .then((r) => r.data),

  timeByTaskType: (filters?: DashboardFilters) =>
    http
      .get<TimeByTaskType[]>('/dashboard/time-by-task-type', {
        params: { weekStartDate: filters?.weekStartDate, weekEndDate: filters?.weekEndDate, userId: filters?.userId },
      })
      .then((r) => r.data),

  // ASSUMPTION: activity-feed only supports paging/sorting (no date/user/project filters) and
  // returns a paged envelope, not a bare array.
  activity: () =>
    http
      .get<PagedResult<ActivityFeedItemResponse>>('/dashboard/activity-feed', {
        params: { page: 1, pageSize: 10, sortBy: 'timestamp', sortDescending: true },
      })
      .then((r) => r.data.items.map(mapActivityItem)),
}
