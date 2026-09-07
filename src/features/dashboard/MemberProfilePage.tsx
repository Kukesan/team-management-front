import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
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

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.memberStats(id!),
    queryFn: () => dashboardApi.memberStats(id!),
  })

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: queryKeys.reports.team({ userId: id }),
    queryFn: () => reportsApi.listTeam({ userId: id }),
  })

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

      {statsLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : stats ? (
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{stats.userName}</h1>
          <p className="text-sm text-slate-500">{stats.email}</p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Avg. compliance</p>
                <p className="text-lg font-semibold text-slate-900">{Math.round(stats.averageCompliance)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Approved reports</p>
                <p className="text-lg font-semibold text-slate-900">{stats.approvedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Needs correction</p>
                <p className="text-lg font-semibold text-slate-900">{stats.needsCorrectionCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Common blockers</p>
                <p className="truncate text-sm font-medium text-slate-900" title={stats.commonBlockers.join(', ')}>
                  {stats.commonBlockers.slice(0, 2).join(', ') || '—'}
                </p>
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
