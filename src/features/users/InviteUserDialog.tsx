import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, UserPlus } from 'lucide-react'
import { usersApi, type InvitedUser } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inviteUserSchema, type InviteUserFormValues } from './schemas'
import type { ApiError, Role } from '@/types'

const ROLES: Role[] = ['TeamMember', 'Manager', 'Admin']

/** Shown once, right after a successful invite, so the admin can hand it to the new user —
 * there's no email-invite infrastructure, so this temporary password is the only place it's
 * ever surfaced (the backend never returns or logs it again after this response). */
function InvitedCredentials({ invited, onDone }: { invited: InvitedUser; onDone: () => void }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invited.temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the password stays
      // visible on screen either way, so this is a soft failure.
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Account created for <span className="font-medium text-slate-900">{invited.email}</span>. Share this
        temporary password with them — it won't be shown again.
      </p>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <code className="flex-1 select-all font-mono text-sm text-slate-900">{invited.temporaryPassword}</code>
        <Button type="button" size="icon" variant="ghost" onClick={copy} aria-label="Copy temporary password">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </div>
  )
}

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [invited, setInvited] = useState<InvitedUser | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: '', email: '', role: 'TeamMember' },
  })

  const inviteMutation = useMutation({
    mutationFn: usersApi.invite,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list })
      setInvited(result)
      reset()
    },
    onError: (err: ApiError) => toast({ title: 'Could not invite user', description: err.message, variant: 'destructive' }),
  })

  const onSubmit = (values: InviteUserFormValues) => inviteMutation.mutate(values)

  const closeAndReset = () => {
    setOpen(false)
    setInvited(null)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeAndReset())}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Invite Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        {invited ? (
          <>
            <DialogHeader>
              <DialogTitle>Team member invited</DialogTitle>
            </DialogHeader>
            <InvitedCredentials invited={invited} onDone={closeAndReset} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite a new team member</DialogTitle>
              <DialogDescription>
                Creates their account right away with a temporary password you'll share with them directly —
                this app doesn't send invite emails yet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="invite-name">Full name</Label>
                <Input id="invite-name" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
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
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" isLoading={isSubmitting}>
                  Create account
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
