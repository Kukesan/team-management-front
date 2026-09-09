import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { AlertTriangle, MessageSquare } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EditableTable } from '@/components/EditableTable'
import { RepeatableList } from '@/components/RepeatableList'
import { HoursBreakdownChart } from '@/features/reports/HoursBreakdownChart'
import { emptyReportForm, reportFormSchema, type ReportFormValues } from '@/features/reports/schemas'
import { formatDate, formatEnumLabel } from '@/lib/format'
import type { ApiError, UpdateReportRequest, WeeklyReport } from '@/types'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
const TASK_STATUSES = ['NotStarted', 'InProgress', 'Completed', 'Blocked', 'Deferred'] as const
const HOURS_TASK_TYPES = [
  'Development',
  'Testing',
  'Meetings',
  'Documentation',
  'CodeReview',
  'Support',
  'Training',
  'Other',
] as const

function toFormValues(report: WeeklyReport): ReportFormValues {
  return {
    projectId: report.projectId,
    weekStartDate: report.weekStartDate.slice(0, 10),
    weekEndDate: report.weekEndDate.slice(0, 10),
    tasks: (report.taskItems ?? []).map((t) => ({ ...t, output: t.output ?? '' })),
    nextWeekTasks: (report.nextWeekTasks ?? []).map((t) => ({ ...t, description: t.description ?? '' })),
    blockers: (report.blockers ?? []).map((b) => ({ ...b, description: b.description ?? '' })),
    achievements: (report.achievements ?? []).map((a) => ({ ...a, description: a.description ?? '' })),
    hoursBreakdown: report.hoursBreakdown ?? [],
    notes: report.notes ?? '',
  }
}

function toUpdateRequest(values: ReportFormValues): UpdateReportRequest {
  return {
    taskItems: values.tasks.map(({ id: _id, ...rest }) => rest),
    nextWeekTasks: values.nextWeekTasks.map(({ id: _id, ...rest }) => rest),
    blockers: values.blockers.map(({ id: _id, ...rest }) => rest),
    achievements: values.achievements.map(({ id: _id, ...rest }) => rest),
    hoursBreakdown: values.hoursBreakdown.map(({ id: _id, ...rest }) => rest),
    notes: values.notes.trim() === '' ? null : values.notes,
  }
}

export function ReportFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [draftSaving, setDraftSaving] = useState(false)

  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: id ? queryKeys.reports.detail(id) : ['reports', 'detail', 'new'],
    queryFn: () => reportsApi.get(id!),
    enabled: isEdit,
  })

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: queryKeys.projects.list,
    queryFn: projectsApi.list,
  })

  const defaultWeek = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const end = endOfWeek(new Date(), { weekStartsOn: 1 })
    return { weekStartDate: format(start, 'yyyy-MM-dd'), weekEndDate: format(end, 'yyyy-MM-dd') }
  }, [])

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    mode: 'onChange',
    defaultValues: emptyReportForm(defaultWeek.weekStartDate, defaultWeek.weekEndDate),
  })

  useEffect(() => {
    if (report) reset(toFormValues(report))
  }, [report, reset])

  const tasksArray = useFieldArray({ control, name: 'tasks' })
  const nextWeekTasksArray = useFieldArray({ control, name: 'nextWeekTasks' })
  const blockersArray = useFieldArray({ control, name: 'blockers' })
  const achievementsArray = useFieldArray({ control, name: 'achievements' })
  const hoursArray = useFieldArray({ control, name: 'hoursBreakdown' })

  const hoursBreakdown = watch('hoursBreakdown')

  const invalidateReportQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }

  /** Persists form content: creates the draft shell first if this is a brand-new report. */
  const persistDraft = async (values: ReportFormValues): Promise<WeeklyReport> => {
    const reportId =
      id ??
      (
        await reportsApi.create({
          projectId: values.projectId,
          weekStartDate: values.weekStartDate,
          weekEndDate: values.weekEndDate,
        })
      ).id
    return reportsApi.update(reportId, toUpdateRequest(values))
  }

  const draftMutation = useMutation({
    mutationFn: persistDraft,
    onSuccess: (saved) => {
      invalidateReportQueries()
      toast({ title: 'Draft saved', variant: 'success' })
      if (!isEdit) navigate(`/reports/${saved.id}/edit`, { replace: true })
    },
    onError: (err: ApiError) => toast({ title: 'Could not save draft', description: err.message, variant: 'destructive' }),
  })

  const submitMutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      const saved = await persistDraft(values)
      return reportsApi.submit(saved.id)
    },
    onSuccess: (saved) => {
      invalidateReportQueries()
      toast({ title: 'Report submitted', variant: 'success' })
      navigate(`/reports/${saved.id}`)
    },
    onError: (err: ApiError) => toast({ title: 'Could not submit report', description: err.message, variant: 'destructive' }),
  })

  const handleSaveDraft = async () => {
    setDraftSaving(true)
    try {
      await draftMutation.mutateAsync(watch())
    } finally {
      setDraftSaving(false)
    }
  }

  const onSubmit = (values: ReportFormValues) => {
    submitMutation.mutate(values)
  }

  const toggleBlockerKey = (index: number) => {
    watch('blockers').forEach((b, i) => {
      setValue(`blockers.${i}.isKeyIssue`, i === index ? !b.isKeyIssue : false, { shouldDirty: true })
    })
  }

  const toggleAchievementKey = (index: number) => {
    watch('achievements').forEach((a, i) => {
      setValue(`achievements.${i}.isKeyAchievement`, i === index ? !a.isKeyAchievement : false, {
        shouldDirty: true,
      })
    })
  }

  if (isEdit && isLoadingReport) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const canEdit = !report || report.status === 'Draft' || report.status === 'NeedsCorrection'
  const latestReview = (report?.reviews ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {isEdit ? 'Edit Weekly Report' : 'New Weekly Report'}
        </h1>
        <p className="text-sm text-slate-500">Fill in your tasks, blockers, and achievements for the week.</p>
      </div>

      {report?.status === 'NeedsCorrection' && latestReview?.comment && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Your manager requested changes</p>
            <p className="mt-1 text-sm text-amber-800">{latestReview.comment}</p>
            <p className="mt-1 text-xs text-amber-700">
              — {latestReview.reviewerFullName}, {formatDate(latestReview.createdAt)}
            </p>
          </div>
        </div>
      )}

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <MessageSquare className="h-4 w-4" />
          This report is {report ? formatEnumLabel(report.status).toLowerCase() : ''} and can no longer be edited.
        </div>
      )}

      <fieldset disabled={!canEdit} className="space-y-6 disabled:opacity-60">
        <Card>
          <CardHeader>
            <CardTitle>Week &amp; Project</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="weekStartDate">Week start</Label>
              <Input id="weekStartDate" type="date" {...register('weekStartDate')} disabled={isEdit} />
              {errors.weekStartDate && <p className="text-xs text-red-600">{errors.weekStartDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weekEndDate">Week end</Label>
              <Input id="weekEndDate" type="date" {...register('weekEndDate')} disabled={isEdit} />
              {errors.weekEndDate && <p className="text-xs text-red-600">{errors.weekEndDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Project / category</Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingProjects || isEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.projectId && <p className="text-xs text-red-600">{errors.projectId.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableTable
              minRows={1}
              rowCount={tasksArray.fields.length}
              onAddRow={() =>
                tasksArray.append({
                  id: crypto.randomUUID(),
                  taskName: '',
                  priority: 'Medium',
                  plannedPercent: 0,
                  actualPercent: 0,
                  status: 'NotStarted',
                  timePlannedHours: 0,
                  timeSpentHours: 0,
                  output: '',
                })
              }
              onRemoveRow={(i) => tasksArray.remove(i)}
              addLabel="Add task"
              columns={[
                {
                  key: 'taskName',
                  label: 'Task',
                  className: 'min-w-[160px]',
                  render: (i) => <Input {...register(`tasks.${i}.taskName`)} placeholder="Task name" />,
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (i) => (
                    <Controller
                      control={control}
                      name={`tasks.${i}.priority`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ),
                },
                {
                  key: 'plannedPercent',
                  label: 'Planned %',
                  render: (i) => (
                    <Input type="number" min={0} max={100} className="w-20" {...register(`tasks.${i}.plannedPercent`, { valueAsNumber: true })} />
                  ),
                },
                {
                  key: 'actualPercent',
                  label: 'Actual %',
                  render: (i) => (
                    <Input type="number" min={0} max={100} className="w-20" {...register(`tasks.${i}.actualPercent`, { valueAsNumber: true })} />
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (i) => (
                    <Controller
                      control={control}
                      name={`tasks.${i}.status`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {formatEnumLabel(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ),
                },
                {
                  key: 'timePlannedHours',
                  label: 'Planned h',
                  render: (i) => (
                    <Input type="number" min={0} step={0.5} className="w-20" {...register(`tasks.${i}.timePlannedHours`, { valueAsNumber: true })} />
                  ),
                },
                {
                  key: 'timeSpentHours',
                  label: 'Actual h',
                  render: (i) => (
                    <Input type="number" min={0} step={0.5} className="w-20" {...register(`tasks.${i}.timeSpentHours`, { valueAsNumber: true })} />
                  ),
                },
                {
                  key: 'output',
                  label: 'Output / deliverable',
                  className: 'min-w-[160px]',
                  render: (i) => <Input {...register(`tasks.${i}.output`)} placeholder="e.g. PR #123" />,
                },
              ]}
            />
            {errors.tasks?.message && <p className="mt-2 text-xs text-red-600">{errors.tasks.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks planned for next week</CardTitle>
          </CardHeader>
          <CardContent>
            <RepeatableList
              ids={nextWeekTasksArray.fields.map((f) => f.id)}
              onAdd={() => nextWeekTasksArray.append({ id: crypto.randomUUID(), description: '' })}
              onRemove={(i) => nextWeekTasksArray.remove(i)}
              addLabel="Add planned task"
              emptyHint="No tasks planned for next week yet."
              renderItem={(i) => (
                <Input {...register(`nextWeekTasks.${i}.description`)} placeholder="Describe the planned task" />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blockers / challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <RepeatableList
              ids={blockersArray.fields.map((f) => f.id)}
              onAdd={() =>
                blockersArray.append({ id: crypto.randomUUID(), description: '', isKeyIssue: false, isResolved: false })
              }
              onRemove={(i) => blockersArray.remove(i)}
              addLabel="Add blocker"
              emptyHint="No blockers reported."
              renderItem={(i) => (
                <div className="flex items-center gap-3">
                  <Input {...register(`blockers.${i}.description`)} placeholder="Describe the blocker" className="flex-1" />
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                    <Switch
                      checked={watch(`blockers.${i}.isKeyIssue`)}
                      onCheckedChange={() => toggleBlockerKey(i)}
                    />
                    Key issue
                  </label>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                    <Switch
                      checked={watch(`blockers.${i}.isResolved`)}
                      onCheckedChange={(checked) => setValue(`blockers.${i}.isResolved`, checked, { shouldDirty: true })}
                    />
                    Resolved
                  </label>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <RepeatableList
              ids={achievementsArray.fields.map((f) => f.id)}
              onAdd={() =>
                achievementsArray.append({ id: crypto.randomUUID(), description: '', isKeyAchievement: false })
              }
              onRemove={(i) => achievementsArray.remove(i)}
              addLabel="Add achievement"
              emptyHint="No achievements logged."
              renderItem={(i) => (
                <div className="flex items-center gap-3">
                  <Input {...register(`achievements.${i}.description`)} placeholder="Describe the achievement" className="flex-1" />
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                    <Switch
                      checked={watch(`achievements.${i}.isKeyAchievement`)}
                      onCheckedChange={() => toggleAchievementKey(i)}
                    />
                    Key achievement
                  </label>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by task type (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RepeatableList
              ids={hoursArray.fields.map((f) => f.id)}
              onAdd={() => hoursArray.append({ id: crypto.randomUUID(), taskType: 'Development', hours: 0 })}
              onRemove={(i) => hoursArray.remove(i)}
              addLabel="Add hours entry"
              emptyHint="No hours logged yet."
              renderItem={(i) => (
                <div className="flex items-center gap-3">
                  <Controller
                    control={control}
                    name={`hoursBreakdown.${i}.taskType`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS_TASK_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {formatEnumLabel(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    className="w-24"
                    {...register(`hoursBreakdown.${i}.hours`, { valueAsNumber: true })}
                  />
                </div>
              )}
            />
            <HoursBreakdownChart entries={hoursBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register('notes')}
              rows={3}
              placeholder="Any additional notes or links relevant to this week's report"
            />
          </CardContent>
        </Card>
      </fieldset>

      {canEdit && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3">
            <Button type="button" variant="outline" onClick={handleSaveDraft} isLoading={draftSaving}>
              Save as Draft
            </Button>
            <Button type="button" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting} disabled={!isValid}>
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
