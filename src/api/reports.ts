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
  page?: number
  pageSize?: number
}

export const reportsApi = {
  /** Current user's own reports. */
  listMine: (params?: ListReportsParams) =>
    http.get<PagedResult<WeeklyReportSummary>>('/reports/mine', { params }).then((r) => r.data.items),

  /** Manager/Admin view across the team. */
  listTeam: (params?: ListReportsParams) =>
    http.get<PagedResult<WeeklyReportSummary>>('/reports', { params }).then((r) => r.data.items),

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
