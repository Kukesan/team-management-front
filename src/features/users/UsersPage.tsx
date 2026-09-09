import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, KeyRound, Trash2 } from 'lucide-react'
import { usersApi, type PasswordResetResultResponse } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InviteUserDialog } from '@/features/users/InviteUserDialog'
import { formatDate } from '@/lib/format'
import type { ApiError, Role, User } from '@/types'

const ROLES: Role[] = ['TeamMember', 'Manager', 'Admin']

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [resetResult, setResetResult] = useState<PasswordResetResultResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: users, isLoading } = useQuery({ queryKey: queryKeys.users.list, queryFn: usersApi.list })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.users.list })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.changeRole(id, role),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Role updated', variant: 'success' })
    },
    onError: (err: ApiError) => toast({ title: 'Could not update role', description: err.message, variant: 'destructive' }),
  })

  const removeMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      invalidate()
      toast({ title: 'User removed', variant: 'success' })
      setDeleteTarget(null)
    },
    onError: (err: ApiError) => toast({ title: 'Could not remove user', description: err.message, variant: 'destructive' }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: usersApi.resetPassword,
    onSuccess: (result) => setResetResult(result),
    onError: (err: ApiError) =>
      toast({ title: 'Could not reset password', description: err.message, variant: 'destructive' }),
  })

  const copyTempPassword = async () => {
    if (!resetResult) return
    try {
      await navigator.clipboard.writeText(resetResult.temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Password stays visible either way — copy is a convenience, not required.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Manage team member accounts and roles.</p>
        </div>
        <InviteUserDialog />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="responsive-table w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Joined</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="w-16 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td data-label="Name" className="px-4 py-3 font-medium text-slate-900">
                    {u.name}
                    {u.id === currentUser?.id && <span className="ml-1.5 text-xs text-slate-400">(you)</span>}
                  </td>
                  <td data-label="Email" className="px-4 py-3 text-slate-600">
                    {u.email}
                  </td>
                  <td data-label="Role" className="px-4 py-3">
                    <Select
                      value={u.role}
                      onValueChange={(role) => roleMutation.mutate({ id: u.id, role: role as Role })}
                      disabled={u.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td data-label="Joined" className="px-4 py-3 text-slate-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td data-label="Status" className="px-4 py-3">
                    <Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        isLoading={resetPasswordMutation.isPending && resetPasswordMutation.variables === u.id}
                        onClick={() => resetPasswordMutation.mutate(u.id)}
                        aria-label="Reset password"
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={u.id === currentUser?.id}
                        onClick={() => setDeleteTarget(u)}
                        aria-label="Remove user"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState title="No users yet" description="Invite your first team member to get started." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{deleteTarget?.name}"? They will immediately lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={removeMutation.isPending}
              onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetResult)} onOpenChange={(open) => !open && setResetResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset</DialogTitle>
            <DialogDescription>
              Share this temporary password with the user directly — it won't be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <code className="flex-1 select-all font-mono text-sm text-slate-900">
              {resetResult?.temporaryPassword}
            </code>
            <Button type="button" size="icon" variant="ghost" onClick={copyTempPassword} aria-label="Copy temporary password">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setResetResult(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
