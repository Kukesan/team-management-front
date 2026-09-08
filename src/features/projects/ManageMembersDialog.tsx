import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { usersApi } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ApiError, Project, ProjectMember } from '@/types'

type Step = 'browse' | 'confirm-assign' | 'confirm-remove'

function toggleId(ids: Set<string>, id: string) {
  const next = new Set(ids)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

export function ManageMembersDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('browse')
  const [assignIds, setAssignIds] = useState<Set<string>>(new Set())
  const [removeIds, setRemoveIds] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: users, isLoading } = useQuery({
    queryKey: queryKeys.users.list,
    queryFn: usersApi.list,
    enabled: open,
  })

  const assignedIds = new Set(project.assignedUsers.map((m) => m.userId))
  const availableUsers = users?.filter((u) => !assignedIds.has(u.id)) ?? []
  const usersToAssign = availableUsers.filter((u) => assignIds.has(u.id))
  const membersToRemove = project.assignedUsers.filter((m) => removeIds.has(m.userId))

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.list })

  const resetSelection = () => {
    setAssignIds(new Set())
    setRemoveIds(new Set())
    setStep('browse')
  }

  const assignMutation = useMutation({
    mutationFn: (userIds: string[]) => projectsApi.assignMembers(project.id, userIds),
    onSuccess: (_data, userIds) => {
      invalidate()
      toast({
        title: userIds.length === 1 ? 'Member assigned' : `${userIds.length} members assigned`,
        variant: 'success',
      })
      resetSelection()
    },
    onError: (err: ApiError) =>
      toast({ title: 'Could not assign members', description: err.message, variant: 'destructive' }),
  })

  const unassignMutation = useMutation({
    mutationFn: (userIds: string[]) => projectsApi.unassignMembers(project.id, userIds),
    onSuccess: (_data, userIds) => {
      invalidate()
      toast({
        title: userIds.length === 1 ? 'Member removed' : `${userIds.length} members removed`,
        variant: 'success',
      })
      resetSelection()
    },
    onError: (err: ApiError) =>
      toast({ title: 'Could not remove members', description: err.message, variant: 'destructive' }),
  })

  const renderUserRow = (name: string, email: string, right: ReactNode, key: string) => (
    <li key={key} className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-900">{name}</span>
        <span className="block truncate text-xs text-slate-500">{email}</span>
      </span>
      {right}
    </li>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetSelection()
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Manage members">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members — {project.name}</DialogTitle>
          <DialogDescription>
            {step === 'confirm-assign' && 'Review the selected users before assigning them.'}
            {step === 'confirm-remove' && 'Review the selected members before removing them.'}
            {step === 'browse' && 'Select one or more users, then apply the change together.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'confirm-assign' && (
          <div className="space-y-3">
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {usersToAssign.map((user) =>
                renderUserRow(
                  user.name,
                  user.email,
                  <Badge variant="outline" className="shrink-0">{user.role}</Badge>,
                  user.id,
                ),
              )}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('browse')} disabled={assignMutation.isPending}>
                Back
              </Button>
              <Button
                isLoading={assignMutation.isPending}
                onClick={() => assignMutation.mutate(Array.from(assignIds))}
              >
                Confirm assign ({usersToAssign.length})
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'confirm-remove' && (
          <div className="space-y-3">
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {membersToRemove.map((member) => renderUserRow(member.fullName, member.email, null, member.userId))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('browse')} disabled={unassignMutation.isPending}>
                Back
              </Button>
              <Button
                variant="destructive"
                isLoading={unassignMutation.isPending}
                onClick={() => unassignMutation.mutate(Array.from(removeIds))}
              >
                Confirm remove ({membersToRemove.length})
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'browse' && (
          <>
            {project.assignedUsers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current members</p>
                <ul className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                  {project.assignedUsers.map((member: ProjectMember) => (
                    <li key={member.userId} className="flex items-center justify-between gap-3 px-3 py-2">
                      <label
                        htmlFor={`remove-${member.userId}`}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                      >
                        <Checkbox
                          id={`remove-${member.userId}`}
                          checked={removeIds.has(member.userId)}
                          onCheckedChange={() => setRemoveIds((prev) => toggleId(prev, member.userId))}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">{member.fullName}</span>
                          <span className="block truncate text-xs text-slate-500">{member.email}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={removeIds.size === 0}
                    onClick={() => setStep('confirm-remove')}
                  >
                    Remove selected ({removeIds.size})
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Add members</p>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !availableUsers.length ? (
                <EmptyState title="No users to add" description="Everyone registered is already on this project." />
              ) : (
                <>
                  <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {availableUsers.map((user) => (
                      <li key={user.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <label htmlFor={`add-${user.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                          <Checkbox
                            id={`add-${user.id}`}
                            checked={assignIds.has(user.id)}
                            onCheckedChange={() => setAssignIds((prev) => toggleId(prev, user.id))}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-900">{user.name}</span>
                            <span className="block truncate text-xs text-slate-500">{user.email}</span>
                          </span>
                        </label>
                        <Badge variant="outline" className="shrink-0">{user.role}</Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end">
                    <Button size="sm" disabled={assignIds.size === 0} onClick={() => setStep('confirm-assign')}>
                      Assign selected ({assignIds.size})
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
