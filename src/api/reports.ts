import { http } from '@/lib/http'
import type {
  CreateReportRequest,
  PagedResult,
  ReportStatus,
  ReportVersionDetail,
  ReportVersionSummary,
  ReviewActionRequest,
  UpdateReportRequest,
  WeeklyReport,
  WeeklyReportSummary,
} from '@/types'

export interface ListReportsParams {
  status?: ReportStatus
  projectId?: string
  userId?: string
  // Range filter used by the caller-facing filter UI. listMine's backend endpoint (GET
  // /reports/mine, ManagerReportsQueryParameters's sibling MyReportsQueryParameters) only
  // supports a single WeekStartDate, so weekEndDate is ignored there — see listMine below.
  // listTeam maps both onto the backend's dateFrom/dateTo range filter.
  weekStartDate?: string
  weekEndDate?: string
  page?: number
  pageSize?: number
}

export const reportsApi = {
  /** Current user's own reports. Only weekStartDate is a real filter on this endpoint
   * (MyReportsQueryParameters has no end-date range) — weekEndDate is accepted here for a
   * consistent ListReportsParams shape but has no effect. */
  listMine: (params?: ListReportsParams) =>
    http.get<PagedResult<WeeklyReportSummary>>('/reports/mine', { params }).then((r) => r.data.items),

  /** Manager/Admin view across the team. weekStartDate/weekEndDate map to the backend's
   * dateFrom/dateTo (ManagerReportsQueryParameters) — the property names differ so they
   * can't be passed through as-is. */
  listTeam: (params?: ListReportsParams) => {
    const { weekStartDate, weekEndDate, ...rest } = params ?? {}
    return http
      .get<PagedResult<WeeklyReportSummary>>('/reports', {
        params: { ...rest, dateFrom: weekStartDate, dateTo: weekEndDate },
      })
      .then((r) => r.data.items)
  },

  get: (id: string) => http.get<WeeklyReport>(`/reports/${id}`).then((r) => r.data),

  versions: (id: string) =>
    http.get<ReportVersionSummary[]>(`/reports/${id}/versions`).then((r) => r.data),

  version: (id: string, versionId: string) =>
    http.get<ReportVersionDetail>(`/reports/${id}/versions/${versionId}`).then((r) => r.data),

  /** Creates the empty draft shell for a new week/project. */
  create: (body: CreateReportRequest) => http.post<WeeklyReport>('/reports', body).then((r) => r.data),

  /** Saves task/blocker/achievement/hours content against an existing draft. */
  update: (id: string, body: UpdateReportRequest) =>
    http.put<WeeklyReport>(`/reports/${id}`, body).then((r) => r.data),

  submit: (id: string) => http.post<WeeklyReport>(`/reports/${id}/submit`).then((r) => r.data),

  review: (id: string, body: ReviewActionRequest) =>
    http.post<WeeklyReport>(`/reports/${id}/review`, body).then((r) => r.data),
}
