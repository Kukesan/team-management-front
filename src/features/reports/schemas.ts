import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Task name is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  plannedPercent: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  actualPercent: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Blocked']),
  plannedHours: z.number().min(0, 'Min 0'),
  actualHours: z.number().min(0, 'Min 0'),
  output: z.string(),
})

export const nextWeekTaskSchema = z.object({
  id: z.string(),
  value: z.string().min(1, 'Required'),
})

export const blockerSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Required'),
  isKeyIssue: z.boolean(),
})

export const achievementSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Required'),
  isKeyAchievement: z.boolean(),
})

export const reportFormSchema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  weekStartDate: z.string().min(1, 'Required'),
  weekEndDate: z.string().min(1, 'Required'),
  tasks: z.array(taskSchema).min(1, 'Add at least one task'),
  nextWeekTasks: z.array(nextWeekTaskSchema),
  blockers: z.array(blockerSchema),
  achievements: z.array(achievementSchema),
  hoursByType: z.object({
    development: z.number().min(0),
    testing: z.number().min(0),
    meetings: z.number().min(0),
    documentation: z.number().min(0),
  }),
  notes: z.string().optional(),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>

export function emptyReportForm(weekStartDate: string, weekEndDate: string): ReportFormValues {
  return {
    projectId: '',
    weekStartDate,
    weekEndDate,
    tasks: [
      {
        id: crypto.randomUUID(),
        name: '',
        priority: 'Medium',
        plannedPercent: 0,
        actualPercent: 0,
        status: 'NotStarted',
        plannedHours: 0,
        actualHours: 0,
        output: '',
      },
    ],
    nextWeekTasks: [],
    blockers: [],
    achievements: [],
    hoursByType: { development: 0, testing: 0, meetings: 0, documentation: 0 },
    notes: '',
  }
}
