/**
 * Shared types mirroring the ASP.NET Core backend's DTOs.
 *
 * ASSUMPTION: the backend prompt did not pin down exact DTO field names/casing,
 * so the shapes below are a reasonable best guess (PascalCase C# properties are
 * assumed to be camelCase over JSON, as is typical with System.Text.Json's
 * default web naming policy). If the real backend differs, only the files in
 * /src/api and /src/types should need to change.
 */

export type Role = 'TeamMember' | 'Manager' | 'Admin'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export type ReportStatus = 'Draft' | 'Submitted' | 'NeedsCorrection' | 'Approved'

export type TaskPriority = 'Low' | 'Medium' | 'High'

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Blocked'

export interface ReportTask {
  id: string
  name: string
  priority: TaskPriority
  plannedPercent: number
  actualPercent: number
  status: TaskStatus
  plannedHours: number
  actualHours: number
  output: string
}

export interface BlockerItem {
  id: string
  description: string
  isKeyIssue: boolean
}

export interface AchievementItem {
  id: string
  description: string
  isKeyAchievement: boolean
}

export type TaskType = 'Development' | 'Testing' | 'Meetings' | 'Documentation'

export interface HoursByType {
  development: number
  testing: number
  meetings: number
  documentation: number
}

export interface ReviewComment {
  id: string
  reportId: string
  versionNumber: number
  action: 'Approved' | 'RequestedChanges'
  comment: string | null
  reviewerId: string
  reviewerName: string
  createdAt: string
}

export interface ReportVersion {
  versionNumber: number
  createdAt: string
  content: WeeklyReportContent
  comment: ReviewComment | null
}

export interface WeeklyReportContent {
  projectId: string
  weekStartDate: string
  weekEndDate: string
  tasks: ReportTask[]
  nextWeekTasks: string[]
  blockers: BlockerItem[]
  achievements: AchievementItem[]
  hoursByType: HoursByType
  notes: string | null
}

export interface WeeklyReport extends WeeklyReportContent {
  id: string
  userId: string
  userName: string
  projectName: string
  status: ReportStatus
  currentVersion: number
  latestComment: ReviewComment | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
}

export interface WeeklyReportSummary {
  id: string
  userId: string
  userName: string
  projectId: string
  projectName: string
  weekStartDate: string
  weekEndDate: string
  status: ReportStatus
  submittedAt: string | null
}

export interface SaveReportRequest extends WeeklyReportContent {
  id?: string
}

export interface ReviewActionRequest {
  action: 'Approve' | 'RequestChanges'
  comment?: string
}

export interface DashboardSummary {
  submittedThisWeek: number
  totalTeamMembers: number
  complianceRate: number
  needsCorrectionCount: number
  openBlockersCount: number
}

export interface TrendPoint {
  weekStartDate: string
  userId?: string
  userName?: string
  tasksCompleted: number
}

export interface StatusByMember {
  userId: string
  userName: string
  draft: number
  submitted: number
  needsCorrection: number
  approved: number
}

export interface WorkloadByProject {
  projectId: string
  projectName: string
  taskCount: number
}

export interface TimeByTaskType {
  taskType: TaskType
  hours: number
}

export interface ActivityItem {
  id: string
  type: 'Submission' | 'Approval' | 'RequestChanges'
  userName: string
  projectName: string
  message: string
  createdAt: string
}

export interface MemberStats {
  userId: string
  userName: string
  email: string
  averageCompliance: number
  approvedCount: number
  needsCorrectionCount: number
  commonBlockers: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}
