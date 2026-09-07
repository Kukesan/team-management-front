import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { formatDateRange } from '@/lib/format'
import type { ReportStatus, WeeklyReportSummary } from '@/types'

const STATUS_OPTIONS: ReportStatus[] = ['Draft', 'Submitted', 'NeedsCorrection', 'Approved']

export function ReportHistoryPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('all')
  const [projectId, setProjectId] = useState<string>('all')

  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.list })

  const params = {
    status: status === 'all' ? undefined : (status as ReportStatus),
    projectId: projectId === 'all' ? undefined : projectId,
  }

  const { data: reports, isLoading } = useQuery({
    queryKey: queryKeys.reports.mine(params),
    queryFn: () => reportsApi.listMine(params),
  })

  const columns = useMemo<ColumnDef<WeeklyReportSummary, any>[]>(
    () => [
      {
        header: 'Week',
        accessorFn: (row) => formatDateRange(row.weekStartDate, row.weekEndDate),
      },
      {
        header: 'Project',
        accessorKey: 'projectName',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link to={`/reports/${row.original.id}`} className="text-sm font-medium text-brand-600 hover:underline">
            View
          </Link>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500">Your weekly report history.</p>
        </div>
        <Button onClick={() => navigate('/reports/new')}>
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && reports?.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Create your first weekly report to get started."
          action={
            <Button size="sm" onClick={() => navigate('/reports/new')}>
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={reports ?? []}
          isLoading={isLoading}
          getRowId={(r) => r.id}
          onRowClick={(r) => navigate(`/reports/${r.id}`)}
        />
      )}
    </div>
  )
}
