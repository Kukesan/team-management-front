import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string(),
  taskName: z.string().min(1, 'Task name is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  plannedPercent: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  actualPercent: z.number().min(0, 'Min 0').max(100, 'Max 100'),
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Blocked', 'Deferred']),
  timePlannedHours: z.number().min(0, 'Min 0'),
  timeSpentHours: z.number().min(0, 'Min 0'),
  output: z.string(),
})

export const blockerSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Required'),
  isKeyIssue: z.boolean(),
  isResolved: z.boolean(),
})

export const achievementSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Required'),
  isKeyAchievement: z.boolean(),
})

export const hoursBreakdownSchema = z.object({
  id: z.string(),
  taskType: z.enum([
    'Development',
    'Testing',
    'Meetings',
    'Documentation',
    'CodeReview',
    'Support',
    'Training',
    'Other',
  ]),
  hours: z.number().min(0, 'Min 0'),
})

export const reportFormSchema = z.object({
  projectId: z.string().min(1, 'Select a project'),
  weekStartDate: z.string().min(1, 'Required'),
  weekEndDate: z.string().min(1, 'Required'),
  tasks: z.array(taskSchema).min(1, 'Add at least one task'),
  blockers: z.array(blockerSchema),
  achievements: z.array(achievementSchema),
  hoursBreakdown: z.array(hoursBreakdownSchema),
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
        taskName: '',
        priority: 'Medium',
        plannedPercent: 0,
        actualPercent: 0,
        status: 'NotStarted',
        timePlannedHours: 0,
        timeSpentHours: 0,
        output: '',
      },
    ],
    blockers: [],
    achievements: [],
    hoursBreakdown: [],
  }
}
