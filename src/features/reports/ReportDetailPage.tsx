import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { queryKeys } from '@/lib/queryClient'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ErrorState'
import { ReportDetailView } from '@/features/reports/ReportDetailView'
import type { ApiError, WeeklyReport } from '@/types'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const { data: report, isLoading, error } = useQuery<WeeklyReport, ApiError>({
    queryKey: queryKeys.reports.detail(id!),
    queryFn: () => reportsApi.get(id!),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    const apiError = error
    if (apiError.status === 403) {
      return <ErrorState icon="forbidden" title="Not authorized" description="You can't view this report." />
    }
    return (
      <ErrorState icon="notfound" title="Report not found" description="This report may have been removed." />
    )
  }

  if (!report) return null

  const canEdit = report.userId === user?.id && (report.status === 'Draft' || report.status === 'NeedsCorrection')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to reports
          </Link>
        </Button>
        {canEdit && (
          <Button size="sm" asChild>
            <Link to={`/reports/${report.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Continue editing
            </Link>
          </Button>
        )}
      </div>
      <ReportDetailView report={report} />
    </div>
  )
}
