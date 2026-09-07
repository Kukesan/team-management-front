import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { usersApi } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ReportStatus } from '@/types'

export interface DashboardFilterState {
  weekStartDate: string
  weekEndDate: string
  userId: string
  projectId: string
  status: string
}

const STATUS_OPTIONS: ReportStatus[] = ['Draft', 'Submitted', 'NeedsCorrection', 'Approved']

export function DashboardFiltersBar({
  filters,
  onChange,
}: {
  filters: DashboardFilterState
  onChange: (next: DashboardFilterState) => void
}) {
  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.list })
  // ASSUMPTION: GET /users is readable by Manager (not just Admin) so the dashboard can list team
  // members for filtering; the Admin-only restriction in the UI applies to the CRUD management page.
  const { data: users } = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })

  const set = <K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">From</Label>
        <Input type="date" value={filters.weekStartDate} onChange={(e) => set('weekStartDate', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">To</Label>
        <Input type="date" value={filters.weekEndDate} onChange={(e) => set('weekEndDate', e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Team member</Label>
        <Select value={filters.userId} onValueChange={(v) => set('userId', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {users
              ?.filter((u) => u.role === 'TeamMember')
              .map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Project</Label>
        <Select value={filters.projectId} onValueChange={(v) => set('projectId', v)}>
          <SelectTrigger className="w-44">
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

      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select value={filters.status} onValueChange={(v) => set('status', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
