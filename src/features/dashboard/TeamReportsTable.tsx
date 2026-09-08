import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateRange } from '@/lib/format'
import type { WeeklyReportSummary } from '@/types'

export function TeamReportsTable({ reports, isLoading }: { reports?: WeeklyReportSummary[]; isLoading: boolean }) {
  const navigate = useNavigate()

  const columns = useMemo<ColumnDef<WeeklyReportSummary, any>[]>(
    () => [
      { header: 'Member', accessorKey: 'userFullName', meta: { filterPlaceholder: 'Filter by member...' } },
      { header: 'Project', accessorKey: 'projectName' },
      { header: 'Week', accessorFn: (row) => formatDateRange(row.weekStartDate, row.weekEndDate) },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ],
    [],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={reports ?? []}
          isLoading={isLoading}
          getRowId={(r) => r.id}
          emptyTitle="No reports"
          emptyDescription="No reports match the current filters. If you're filtering by 'Not started', check the submission tracker above instead — there's no report to open yet."
          onRowClick={(r) => navigate(`/review/${r.id}`)}
        />
      </CardContent>
    </Card>
  )
}
