import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { reportsApi } from '@/api/reports'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateRange } from '@/lib/format'
import type { ReportStatus, WeeklyReportSummary } from '@/types'

const STATUS_OPTIONS: ReportStatus[] = ['Submitted', 'NeedsCorrection', 'Approved', 'Draft']

export function ReviewQueuePage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('Submitted')
  const [projectId, setProjectId] = useState<string>('all')

  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.list })

  const params = {
    status: status === 'all' ? undefined : (status as ReportStatus),
    projectId: projectId === 'all' ? undefined : projectId,
  }

  const { data: reports, isLoading } = useQuery({
    queryKey: queryKeys.reports.team(params),
    queryFn: () => reportsApi.listTeam(params),
  })

  const columns = useMemo<ColumnDef<WeeklyReportSummary, any>[]>(
    () => [
      { header: 'Member', accessorKey: 'userName', meta: { filterPlaceholder: 'Filter by member...' } },
      { header: 'Project', accessorKey: 'projectName' },
      { header: 'Week', accessorFn: (row) => formatDateRange(row.weekStartDate, row.weekEndDate) },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Review Queue</h1>
        <p className="text-sm text-slate-500">Open a report to approve it or request changes.</p>
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

      <DataTable
        columns={columns}
        data={reports ?? []}
        isLoading={isLoading}
        getRowId={(r) => r.id}
        emptyTitle="Nothing to review"
        emptyDescription="No reports match the current filters."
        onRowClick={(r) => navigate(`/review/${r.id}`)}
      />
    </div>
  )
}
