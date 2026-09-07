import { z } from 'zod'

export const inviteUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['TeamMember', 'Manager', 'Admin']),
})
export type InviteUserFormValues = z.infer<typeof inviteUserSchema>
