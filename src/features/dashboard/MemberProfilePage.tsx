import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '@/api/users'
import { reportsApi } from '@/api/reports'
import { queryKeys } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateRange } from '@/lib/format'
import type { ColumnDef } from '@tanstack/react-table'
import type { WeeklyReportSummary } from '@/types'

// NOTE: the backend has no per-member stats endpoint (no GET /dashboard/members/{id}/stats),
// so this page derives everything from GET /users (for name/email) and GET /reports?userId=
// (for status counts and history) instead of a dedicated aggregate.
export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()

  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })
  const member = users?.find((u) => u.id === id)

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: queryKeys.reports.team({ userId: id }),
    queryFn: () => reportsApi.listTeam({ userId: id }),
  })

  const approvedCount = reports?.filter((r) => r.status === 'Approved').length ?? 0
  const needsCorrectionCount = reports?.filter((r) => r.status === 'NeedsCorrection').length ?? 0

  const columns: ColumnDef<WeeklyReportSummary, any>[] = [
    { header: 'Week', accessorFn: (row) => formatDateRange(row.weekStartDate, row.weekEndDate) },
    { header: 'Project', accessorKey: 'projectName' },
    { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link to={`/reports/${row.original.id}`} className="text-sm font-medium text-brand-600 hover:underline">
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>

      {usersLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : member ? (
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{member.name}</h1>
          <p className="text-sm text-slate-500">{member.email}</p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Total reports</p>
                <p className="text-lg font-semibold text-slate-900">{reports?.length ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Approved reports</p>
                <p className="text-lg font-semibold text-slate-900">{approvedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Needs correction</p>
                <p className="text-lg font-semibold text-slate-900">{needsCorrectionCount}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Report history</h2>
        <DataTable
          columns={columns}
          data={reports ?? []}
          isLoading={reportsLoading}
          getRowId={(r) => r.id}
          emptyTitle="No reports yet"
        />
      </div>
    </div>
  )
}
