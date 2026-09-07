import { AlertOctagon, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummary } from '@/types'

export function SummaryCards({ summary, isLoading }: { summary?: DashboardSummary; isLoading: boolean }) {
  const cards = [
    {
      label: 'Submitted this week',
      value: summary ? `${summary.submittedThisWeek}/${summary.totalTeamMembers}` : '—',
      icon: ClipboardList,
      accent: 'text-brand-600 bg-brand-50',
    },
    {
      label: 'Compliance rate',
      value: summary ? `${Math.round(summary.complianceRate)}%` : '—',
      icon: TrendingUp,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Needs correction',
      value: summary ? summary.needsCorrectionCount : '—',
      icon: AlertOctagon,
      accent: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Open blockers',
      value: summary ? summary.openBlockersCount : '—',
      icon: CheckCircle2,
      accent: 'text-red-600 bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 pt-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-lg font-semibold text-slate-900">{value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
