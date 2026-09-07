import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { queryKeys } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ErrorState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ReportDetailView } from '@/features/reports/ReportDetailView'
import type { ApiError, WeeklyReport } from '@/types'

export function ManagerReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [comment, setComment] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: report, isLoading, error } = useQuery<WeeklyReport, ApiError>({
    queryKey: queryKeys.reports.detail(id!),
    queryFn: () => reportsApi.get(id!),
  })

  const reviewMutation = useMutation({
    mutationFn: (body: { action: 'Approve' | 'RequestChanges'; comment?: string }) => reportsApi.review(id!, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast({
        title: variables.action === 'Approve' ? 'Report approved' : 'Changes requested',
        variant: 'success',
      })
      navigate('/review')
    },
    onError: (err: ApiError) => toast({ title: 'Review action failed', description: err.message, variant: 'destructive' }),
  })

  const handleRequestChanges = () => {
    if (comment.trim().length < 3) return
    reviewMutation.mutate({ action: 'RequestChanges', comment: comment.trim() })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    if (error?.status === 403) {
      return <ErrorState icon="forbidden" title="Not authorized" description="You can't review this report." />
    }
    return <ErrorState icon="notfound" title="Report not found" description="This report may have been removed." />
  }

  const canReview = report.status === 'Submitted'

  return (
    <div className="space-y-4 pb-20">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/review">
          <ArrowLeft className="h-4 w-4" />
          Back to review queue
        </Link>
      </Button>

      <ReportDetailView report={report} />

      {canReview && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <X className="h-4 w-4" />
                  Request Changes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request changes</DialogTitle>
                  <DialogDescription>
                    Explain what needs to change. This comment is shown to the team member before they can resubmit.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-1.5">
                  <Label htmlFor="review-comment">Comment</Label>
                  <Textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Please break down the 'Backend work' task into individual tickets."
                  />
                  {comment.trim().length > 0 && comment.trim().length < 3 && (
                    <p className="text-xs text-red-600">Comment is too short.</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleRequestChanges}
                    disabled={comment.trim().length < 3}
                    isLoading={reviewMutation.isPending}
                  >
                    Send back for changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="success"
              onClick={() => reviewMutation.mutate({ action: 'Approve' })}
              isLoading={reviewMutation.isPending}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
