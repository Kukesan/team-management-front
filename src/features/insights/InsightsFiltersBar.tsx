import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface InsightsFilterState {
  weekStartDate: string
  weekEndDate: string
  userId: string
}

export function InsightsFiltersBar({
  filters,
  onChange,
}: {
  filters: InsightsFilterState
  onChange: (next: InsightsFilterState) => void
}) {
  const { data: users } = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })

  const set = <K extends keyof InsightsFilterState>(key: K, value: InsightsFilterState[K]) =>
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members (team-wide)</SelectItem>
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
    </div>
  )
}
