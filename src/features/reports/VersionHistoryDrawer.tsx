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

export function VersionHistoryDrawer({ reportId }: { reportId: string }) {
  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey: queryKeys.reports.versions(reportId),
    queryFn: () => reportsApi.versions(reportId),
    enabled: false,
  })

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
              .map((version) => (
                <li key={version.versionNumber} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">Version {version.versionNumber}</span>
                    <span className="text-xs text-slate-500">{formatDate(version.createdAt, 'MMM d, yyyy p')}</span>
                  </div>
                  {version.comment ? (
                    <div className="mt-2 flex items-start justify-between gap-2 rounded-md bg-slate-50 p-2">
                      <div>
                        <Badge variant={version.comment.action === 'Approved' ? 'success' : 'warning'}>
                          {version.comment.action === 'Approved' ? 'Approved' : 'Changes requested'}
                        </Badge>
                        {version.comment.comment && (
                          <p className="mt-1 text-sm text-slate-600">{version.comment.comment}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{version.comment.reviewerName}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">No review comment against this version.</p>
                  )}
                </li>
              ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
