import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfWeek } from 'date-fns'
import { Sparkles } from 'lucide-react'
import { aiApi } from '@/api/ai'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryClient'
import { renderMarkdown } from '@/lib/markdown'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import type { ApiError } from '@/types'

export function SummaryPanel() {
  const [weekStart, setWeekStart] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'))
  const [projectId, setProjectId] = useState('all')
  const { toast } = useToast()

  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.list })

  const params = { weekStart, projectId: projectId === 'all' ? undefined : projectId }
  const summaryQuery = useQuery({
    queryKey: queryKeys.ai.summary(params),
    queryFn: () => aiApi.summary(params.weekStart, params.projectId),
    enabled: false,
    retry: 0,
  })

  const handleGenerate = () => {
    summaryQuery.refetch().catch((err: ApiError) => {
      toast({ title: 'Summary generation failed', description: err.message, variant: 'destructive' })
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Week starting</Label>
          <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="w-40" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-48">
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

        <Button onClick={handleGenerate} isLoading={summaryQuery.isFetching}>
          <Sparkles className="h-4 w-4" />
          Generate summary
        </Button>
      </div>

      {summaryQuery.isFetching && (
        <Card>
          <CardContent className="space-y-2 pt-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      )}

      {!summaryQuery.isFetching && summaryQuery.data && (
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span>Week of {summaryQuery.data.weekStart}</span>
              <span>Generated {format(new Date(summaryQuery.data.generatedAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <div className="text-sm leading-relaxed text-slate-800">{renderMarkdown(summaryQuery.data.summaryMarkdown)}</div>
          </CardContent>
        </Card>
      )}

      {!summaryQuery.isFetching && !summaryQuery.data && !summaryQuery.isError && (
        <EmptyState
          icon={Sparkles}
          title="No summary generated yet"
          description="Pick a week and, optionally, a project, then generate an AI summary of completed work, blockers, and workload."
        />
      )}
    </div>
  )
}
