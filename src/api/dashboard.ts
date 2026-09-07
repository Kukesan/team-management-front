import { http } from '@/lib/http'
import type {
  ActivityItem,
  DashboardSummary,
  MemberStats,
  StatusByMember,
  TimeByTaskType,
  TrendPoint,
  WorkloadByProject,
} from '@/types'

export interface DashboardFilters {
  weekStartDate?: string
  weekEndDate?: string
  userId?: string
  projectId?: string
  status?: string
}

export const dashboardApi = {
  summary: (filters?: DashboardFilters) =>
    http.get<DashboardSummary>('/dashboard/summary', { params: filters }).then((r) => r.data),

  completionTrend: (filters?: DashboardFilters) =>
    http.get<TrendPoint[]>('/dashboard/trend', { params: filters }).then((r) => r.data),

  statusByMember: (filters?: DashboardFilters) =>
    http
      .get<StatusByMember[]>('/dashboard/status-by-member', { params: filters })
      .then((r) => r.data),

  workloadByProject: (filters?: DashboardFilters) =>
    http
      .get<WorkloadByProject[]>('/dashboard/workload-by-project', { params: filters })
      .then((r) => r.data),

  timeByTaskType: (filters?: DashboardFilters) =>
    http
      .get<TimeByTaskType[]>('/dashboard/time-by-task-type', { params: filters })
      .then((r) => r.data),

  activity: (filters?: DashboardFilters) =>
    http.get<ActivityItem[]>('/dashboard/activity', { params: filters }).then((r) => r.data),

  memberStats: (userId: string) =>
    http.get<MemberStats>(`/dashboard/members/${userId}/stats`).then((r) => r.data),
}
