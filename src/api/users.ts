import { http } from '@/lib/http'
import type { Role, User } from '@/types'

export interface InviteUserRequest {
  name: string
  email: string
  role: Role
}

export const usersApi = {
  list: () => http.get<User[]>('/users').then((r) => r.data),

  invite: (body: InviteUserRequest) => http.post<User>('/users/invite', body).then((r) => r.data),

  changeRole: (id: string, role: Role) =>
    http.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`/users/${id}`).then((r) => r.data),
}
