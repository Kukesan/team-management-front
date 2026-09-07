import { http } from '@/lib/http'
import type {
  ReportStatus,
  ReportVersion,
  ReviewActionRequest,
  SaveReportRequest,
  WeeklyReport,
  WeeklyReportSummary,
} from '@/types'

export interface ListReportsParams {
  status?: ReportStatus
  projectId?: string
  userId?: string
  page?: number
  pageSize?: number
}

export const reportsApi = {
  /** Current user's own reports. */
  listMine: (params?: ListReportsParams) =>
    http.get<WeeklyReportSummary[]>('/reports/mine', { params }).then((r) => r.data),

  /** Manager/Admin view across the team. */
  listTeam: (params?: ListReportsParams) =>
    http.get<WeeklyReportSummary[]>('/reports', { params }).then((r) => r.data),

  get: (id: string) => http.get<WeeklyReport>(`/reports/${id}`).then((r) => r.data),

  versions: (id: string) =>
    http.get<ReportVersion[]>(`/reports/${id}/versions`).then((r) => r.data),

  saveDraft: (body: SaveReportRequest) =>
    body.id
      ? http.put<WeeklyReport>(`/reports/${body.id}`, { ...body, status: 'Draft' }).then((r) => r.data)
      : http.post<WeeklyReport>('/reports', { ...body, status: 'Draft' }).then((r) => r.data),

  submit: (body: SaveReportRequest) =>
    body.id
      ? http.put<WeeklyReport>(`/reports/${body.id}/submit`, body).then((r) => r.data)
      : http.post<WeeklyReport>('/reports/submit', body).then((r) => r.data),

  review: (id: string, body: ReviewActionRequest) =>
    http.post<WeeklyReport>(`/reports/${id}/review`, body).then((r) => r.data),
}
