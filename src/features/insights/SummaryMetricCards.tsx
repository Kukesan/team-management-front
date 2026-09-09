import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, ShieldAlert, TriangleAlert } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryClient'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/format'

export function SummaryMetricCards({ weekStartDate }: { weekStartDate: string }) {
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary({ weekStartDate }),
    queryFn: () => dashboardApi.summary({ weekStartDate }),
  })

  const tiles = [
    {
      label: 'Submitted this week',
      value: summaryQuery.data?.totalSubmitted,
      icon: ClipboardList,
      iconClass: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Compliance rate',
      value: summaryQuery.data ? formatPercent(summaryQuery.data.complianceRatePercent) : undefined,
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Needs correction',
      value: summaryQuery.data?.needsCorrectionCount,
      icon: TriangleAlert,
      iconClass: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Open blockers',
      value: summaryQuery.data?.openBlockersCount,
      icon: ShieldAlert,
      iconClass: 'bg-red-50 text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardContent className="flex items-center gap-4 pt-4 sm:pt-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tile.iconClass}`}>
              <tile.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-500">{tile.label}</p>
              {summaryQuery.isLoading ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-xl font-semibold text-slate-900">{tile.value ?? '—'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
