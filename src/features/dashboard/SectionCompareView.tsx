import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { Flag } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { formatEnumLabel, formatPercent } from '@/lib/format'
import type { WeeklyReport, WeeklyReportSummary } from '@/types'

type Section = 'tasks' | 'blockers' | 'achievements'

const SECTION_OPTIONS: { value: Section; label: string }[] = [
  { value: 'blockers', label: 'Blockers' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'tasks', label: 'Tasks' },
]

function SectionContent({ report, section }: { report: WeeklyReport; section: Section }) {
  if (section === 'blockers') {
    if (report.blockers.length === 0) return <p className="text-sm text-slate-400">No blockers reported.</p>
    return (
      <ul className="space-y-1.5 text-sm text-slate-700">
        {report.blockers.map((b) => (
          <li key={b.id} className="flex items-start gap-1.5">
            {b.isKeyIssue && <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
            <span className={b.isKeyIssue ? 'font-medium text-red-700' : undefined}>{b.description}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (section === 'achievements') {
    if (report.achievements.length === 0) return <p className="text-sm text-slate-400">No achievements logged.</p>
    return (
      <ul className="space-y-1.5 text-sm text-slate-700">
        {report.achievements.map((a) => (
          <li key={a.id} className="flex items-start gap-1.5">
            {a.isKeyAchievement && <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
            <span className={a.isKeyAchievement ? 'font-medium text-emerald-700' : undefined}>{a.description}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (report.taskItems.length === 0) return <p className="text-sm text-slate-400">No tasks logged.</p>
  return (
    <ul className="space-y-2 text-sm">
      {report.taskItems.map((task) => (
        <li key={task.id} className="space-y-0.5">
          <p className="font-medium text-slate-900">{task.taskName}</p>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Badge variant="outline">{formatEnumLabel(task.status)}</Badge>
            <span>{formatPercent(task.actualPercent)} done</span>
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * Bonus feature: lets a manager compare one section of every team member's report for the
 * selected week side by side, instead of opening each report individually.
 */
export function SectionCompareView({
  reports,
  isLoading,
}: {
  reports?: WeeklyReportSummary[]
  isLoading: boolean
}) {
  const [section, setSection] = useState<Section>('blockers')
  const summaries = reports ?? []

  const detailQueries = useQueries({
    queries: summaries.map((r) => ({
      queryKey: queryKeys.reports.detail(r.id),
      queryFn: () => reportsApi.get(r.id),
      enabled: summaries.length > 0,
    })),
  })

  const isLoadingDetails = isLoading || detailQueries.some((q) => q.isLoading)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Compare across the team</CardTitle>
        <Select value={section} onValueChange={(v) => setSection(v as Section)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTION_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoadingDetails ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : summaries.length === 0 ? (
          <EmptyState
            title="Nothing to compare"
            description="No reports match the current filters for this week."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {detailQueries.map((q, i) => {
              const summary = summaries[i]
              if (!q.data) return null
              return (
                <div key={summary.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/review/${summary.id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                        {summary.userFullName}
                      </Link>
                      <p className="text-xs text-slate-500">{summary.projectName}</p>
                    </div>
                    <StatusBadge status={summary.status} />
                  </div>
                  <SectionContent report={q.data} section={section} />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
