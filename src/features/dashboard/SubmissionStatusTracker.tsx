import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { SubmissionStatusFilter } from '@/features/dashboard/DashboardFiltersBar'
import type { ReportStatus, StatusByMemberResponse, User } from '@/types'

const STATUS_LABEL: Record<ReportStatus, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  NeedsCorrection: 'Needs Correction',
  Approved: 'Approved',
}

const STATUS_VARIANT: Record<ReportStatus, 'default' | 'brand' | 'success' | 'warning'> = {
  Draft: 'default',
  Submitted: 'brand',
  NeedsCorrection: 'warning',
  Approved: 'success',
}

interface MemberRow {
  userId: string
  userName: string
  counts: Record<ReportStatus, number>
  total: number
}

function buildRow(member: User, statusRow: StatusByMemberResponse | undefined, projectId: string): MemberRow {
  const reports = (statusRow?.reports ?? []).filter((r) => projectId === 'all' || r.projectId === projectId)
  const counts: Record<ReportStatus, number> = { Draft: 0, Submitted: 0, NeedsCorrection: 0, Approved: 0 }
  for (const report of reports) counts[report.status] += 1
  return { userId: member.id, userName: member.name, counts, total: reports.length }
}

function matchesStatusFilter(row: MemberRow, statusFilter: SubmissionStatusFilter | 'all') {
  if (statusFilter === 'all') return true
  if (statusFilter === 'NotStarted') return row.total === 0
  return row.counts[statusFilter] > 0
}

export function SubmissionStatusTracker({
  members,
  statusRows,
  isLoading,
  projectId,
  statusFilter,
}: {
  members: User[]
  statusRows?: StatusByMemberResponse[]
  isLoading: boolean
  projectId: string
  statusFilter: SubmissionStatusFilter | 'all'
}) {
  const rows = members
    .map((member) => buildRow(member, statusRows?.find((r) => r.userId === member.id), projectId))
    .filter((row) => matchesStatusFilter(row, statusFilter))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission status by team member</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No members match" description="No team members match the current filters." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.userId}>
                <Link
                  to={`/dashboard/members/${row.userId}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm hover:text-brand-600"
                >
                  <span className="font-medium text-slate-900">{row.userName}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {row.total === 0 ? (
                      <Badge variant="outline">Not started</Badge>
                    ) : (
                      (Object.keys(row.counts) as ReportStatus[])
                        .filter((status) => row.counts[status] > 0)
                        .map((status) => (
                          <Badge key={status} variant={STATUS_VARIANT[status]}>
                            {row.counts[status]} {STATUS_LABEL[status]}
                          </Badge>
                        ))
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
