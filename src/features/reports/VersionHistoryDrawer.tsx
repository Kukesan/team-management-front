import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { queryKeys } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatDate } from '@/lib/format'
import type { ReportReview } from '@/types'

export function VersionHistoryDrawer({ reportId, reviews }: { reportId: string; reviews: ReportReview[] }) {
  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey: queryKeys.reports.versions(reportId),
    queryFn: () => reportsApi.versions(reportId),
    enabled: false,
  })

  const reviewsByVersion = new Map<number, ReportReview[]>()
  for (const review of reviews) {
    const list = reviewsByVersion.get(review.reportVersionNumber) ?? []
    list.push(review)
    reviewsByVersion.set(review.reportVersionNumber, list)
  }

  return (
    <Dialog onOpenChange={(open) => open && !isFetched && refetch()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4" />
          View past versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <EmptyState title="No prior versions" description="This report has not been revised yet." />
        )}

        {!isLoading && data && data.length > 0 && (
          <ol className="space-y-3">
            {data
              .slice()
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .map((version) => {
                const versionReviews = reviewsByVersion.get(version.versionNumber) ?? []
                return (
                  <li key={version.versionNumber} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">Version {version.versionNumber}</span>
                      <span className="text-xs text-slate-500">
                        {formatDate(version.submittedAt, 'MMM d, yyyy p')}
                      </span>
                    </div>
                    {versionReviews.length === 0 ? (
                      <p className="mt-1 text-xs text-slate-400">No review comment against this version.</p>
                    ) : (
                      versionReviews.map((review) => (
                        <div
                          key={review.id}
                          className="mt-2 flex items-start justify-between gap-2 rounded-md bg-slate-50 p-2"
                        >
                          <div>
                            <Badge variant={review.action === 'Approved' ? 'success' : 'warning'}>
                              {review.action === 'Approved' ? 'Approved' : 'Changes requested'}
                            </Badge>
                            {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">{review.reviewerFullName}</span>
                        </div>
                      ))
                    )}
                  </li>
                )
              })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
