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

/**
 * Shape actually returned by /auth/login and /auth/register: `fullName`
 * instead of `name`, and `roles` as an array instead of a single `role`.
 * Mapped to `User` in src/api/auth.ts before it touches the rest of the app.
 */
export interface AuthUserResponse {
  id: string
  fullName: string
  email: string
  roles: Role[]
}

export interface AuthResponse {
  token: string
  expiresAtUtc: string
  user: AuthUserResponse
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

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Blocked' | 'Deferred'

export interface ReportTask {
  id: string
  taskName: string
  priority: TaskPriority
  plannedPercent: number
  actualPercent: number
  status: TaskStatus
  timePlannedHours: number
  timeSpentHours: number
  output: string | null
}

export interface TaskItemRequest {
  taskName: string
  priority: TaskPriority
  plannedPercent: number
  actualPercent: number
  status: TaskStatus
  timePlannedHours: number
  timeSpentHours: number
  output: string | null
}

export interface BlockerItem {
  id: string
  description: string
  isKeyIssue: boolean
  isResolved: boolean
}

export interface BlockerRequest {
  description: string
  isKeyIssue: boolean
  isResolved: boolean
}

export interface AchievementItem {
  id: string
  description: string
  isKeyAchievement: boolean
}

export interface AchievementRequest {
  description: string
  isKeyAchievement: boolean
}

export type TaskType =
  | 'Development'
  | 'Testing'
  | 'Meetings'
  | 'Documentation'
  | 'CodeReview'
  | 'Support'
  | 'Training'
  | 'Other'

export interface HoursBreakdownItem {
  id: string
  taskType: TaskType
  hours: number
}

export interface HoursBreakdownRequest {
  taskType: TaskType
  hours: number
}

export type ReviewAction = 'Approved' | 'RequestedChanges'

export interface ReportReview {
  id: string
  reportVersionNumber: number
  reviewerId: string
  reviewerFullName: string
  action: ReviewAction
  comment: string | null
  createdAt: string
}

export interface ReportVersionSummary {
  id: string
  versionNumber: number
  submittedAt: string
}

export interface ReportVersionDetail extends ReportVersionSummary {
  taskItems: ReportTask[]
  blockers: BlockerItem[]
  achievements: AchievementItem[]
  hoursBreakdown: HoursBreakdownItem[]
}

export interface WeeklyReport {
  id: string
  userId: string
  userFullName: string
  projectId: string
  projectName: string
  weekStartDate: string
  weekEndDate: string
  status: ReportStatus
  currentVersionNumber: number
  createdAt: string
  updatedAt: string
  taskItems: ReportTask[]
  blockers: BlockerItem[]
  achievements: AchievementItem[]
  hoursBreakdown: HoursBreakdownItem[]
  reviews: ReportReview[]
}

export interface WeeklyReportSummary {
  id: string
  userId: string
  userFullName: string
  projectId: string
  projectName: string
  weekStartDate: string
  weekEndDate: string
  status: ReportStatus
  currentVersionNumber: number
  updatedAt: string
}

export interface CreateReportRequest {
  projectId: string
  weekStartDate: string
  weekEndDate: string
}

export interface UpdateReportRequest {
  taskItems: TaskItemRequest[]
  blockers: BlockerRequest[]
  achievements: AchievementRequest[]
  hoursBreakdown: HoursBreakdownRequest[]
}

export interface ReviewActionRequest {
  action: ReviewAction
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
