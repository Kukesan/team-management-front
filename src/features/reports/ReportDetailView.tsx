import { Flag } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoursBreakdownChart } from '@/features/reports/HoursBreakdownChart'
import { VersionHistoryDrawer } from '@/features/reports/VersionHistoryDrawer'
import { formatDateRange, formatEnumLabel, formatHours, formatPercent } from '@/lib/format'
import type { WeeklyReport } from '@/types'

const TASK_STATUS_VARIANT = {
  NotStarted: 'default',
  InProgress: 'brand',
  Completed: 'success',
  Blocked: 'danger',
  Deferred: 'default',
} as const

export function ReportDetailView({ report }: { report: WeeklyReport }) {
  const latestReview = (report.reviews ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{report.userFullName}</h1>
          <p className="text-sm text-slate-500">
            {report.projectName} &middot; {formatDateRange(report.weekStartDate, report.weekEndDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          <VersionHistoryDrawer reportId={report.id} reviews={report.reviews ?? []} />
        </div>
      </div>

      {report.status === 'NeedsCorrection' && latestReview?.comment && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Manager feedback</p>
          <p className="mt-1">{latestReview.comment}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="responsive-table w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-3">Task</th>
                <th className="py-2 pr-3">Priority</th>
                <th className="py-2 pr-3">Planned %</th>
                <th className="py-2 pr-3">Actual %</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Planned h</th>
                <th className="py-2 pr-3">Actual h</th>
                <th className="py-2">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report.taskItems ?? []).map((task) => (
                <tr key={task.id}>
                  <td data-label="Task" className="py-2 pr-3 font-medium text-slate-900">
                    {task.taskName}
                  </td>
                  <td data-label="Priority" className="py-2 pr-3">
                    {task.priority}
                  </td>
                  <td data-label="Planned %" className="py-2 pr-3">
                    {formatPercent(task.plannedPercent)}
                  </td>
                  <td data-label="Actual %" className="py-2 pr-3">
                    {formatPercent(task.actualPercent)}
                  </td>
                  <td data-label="Status" className="py-2 pr-3">
                    <Badge variant={TASK_STATUS_VARIANT[task.status]}>{formatEnumLabel(task.status)}</Badge>
                  </td>
                  <td data-label="Planned h" className="py-2 pr-3">
                    {formatHours(task.timePlannedHours)}
                  </td>
                  <td data-label="Actual h" className="py-2 pr-3">
                    {formatHours(task.timeSpentHours)}
                  </td>
                  <td data-label="Output" className="py-2 text-slate-600">
                    {task.output || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Blockers / challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {(report.blockers ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No blockers reported.</p>
            ) : (
              <ul className="space-y-1.5 text-sm text-slate-700">
                {(report.blockers ?? []).map((b) => (
                  <li key={b.id} className="flex items-start gap-1.5">
                    {b.isKeyIssue && <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
                    <span className={b.isKeyIssue ? 'font-medium text-red-700' : undefined}>{b.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {(report.achievements ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No achievements logged.</p>
            ) : (
              <ul className="space-y-1.5 text-sm text-slate-700">
                {(report.achievements ?? []).map((a) => (
                  <li key={a.id} className="flex items-start gap-1.5">
                    {a.isKeyAchievement && <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    <span className={a.isKeyAchievement ? 'font-medium text-emerald-700' : undefined}>
                      {a.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by task type</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursBreakdownChart entries={report.hoursBreakdown ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
