import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { projectsApi, type SaveProjectRequest } from '@/api/projects'
import { queryKeys } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ManageMembersDialog } from '@/features/projects/ManageMembersDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ApiError, Project } from '@/types'

const emptyDraft: SaveProjectRequest = { name: '', description: '', isActive: true }

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: projects, isLoading } = useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.list })

  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<SaveProjectRequest>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<SaveProjectRequest>(emptyDraft)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.list })

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Project created', variant: 'success' })
      setCreating(false)
      setDraft(emptyDraft)
    },
    onError: (err: ApiError) => toast({ title: 'Could not create project', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: SaveProjectRequest }) => projectsApi.update(id, body),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Project updated', variant: 'success' })
      setEditingId(null)
    },
    onError: (err: ApiError) => toast({ title: 'Could not update project', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Project deleted', variant: 'success' })
      setDeleteTarget(null)
    },
    onError: (err: ApiError) => toast({ title: 'Could not delete project', description: err.message, variant: 'destructive' }),
  })

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setEditDraft({ name: project.name, description: project.description ?? '', isActive: project.isActive })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Manage the projects/categories used in weekly reports.</p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Members</th>
                <th className="w-32 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creating && (
                <tr className="bg-brand-50/40">
                  <td className="px-4 py-2">
                    <Input
                      autoFocus
                      placeholder="Project name"
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      placeholder="Description (optional)"
                      value={draft.description}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Switch
                      checked={draft.isActive}
                      onCheckedChange={(v) => setDraft((d) => ({ ...d, isActive: v }))}
                    />
                  </td>
                  <td className="px-4 py-2 text-slate-400">—</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!draft.name.trim()}
                        onClick={() => createMutation.mutate(draft)}
                        aria-label="Save"
                      >
                        <Check className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setCreating(false)
                          setDraft(emptyDraft)
                        }}
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {projects?.map((project) =>
                editingId === project.id ? (
                  <tr key={project.id} className="bg-brand-50/40">
                    <td className="px-4 py-2">
                      <Input
                        value={editDraft.name}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editDraft.description}
                        onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Switch
                        checked={editDraft.isActive}
                        onCheckedChange={(v) => setEditDraft((d) => ({ ...d, isActive: v }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <ManageMembersDialog project={project} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!editDraft.name.trim()}
                          onClick={() => updateMutation.mutate({ id: project.id, body: editDraft })}
                          aria-label="Save"
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel">
                          <X className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                    <td className="px-4 py-3 text-slate-600">{project.description || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={project.isActive ? 'success' : 'default'}>
                        {project.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {project.assignedUsers.length === 0 ? (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {project.assignedUsers.slice(0, 3).map((member) => (
                            <Badge key={member.userId} variant="brand">
                              {member.fullName}
                            </Badge>
                          ))}
                          {project.assignedUsers.length > 3 && (
                            <Badge variant="outline">+{project.assignedUsers.length - 3} more</Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <ManageMembersDialog project={project} />
                        <Button size="icon" variant="ghost" onClick={() => startEdit(project)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteTarget(project)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {!creating && !projects?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <EmptyState title="No projects yet" description="Add your first project to get started." />
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
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
