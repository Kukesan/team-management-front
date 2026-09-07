import { http } from '@/lib/http'
import type { PagedResult, Role, User } from '@/types'

export interface InviteUserRequest {
  name: string
  email: string
  role: Role
}

export const usersApi = {
  // Backend may return either a raw array or a paged envelope ({ items, ... });
  // normalize here so every caller can keep treating the result as User[].
  list: () =>
    http.get<User[] | PagedResult<User>>('/users').then((r) =>
      Array.isArray(r.data) ? r.data : r.data.items,
    ),

  invite: (body: InviteUserRequest) => http.post<User>('/users/invite', body).then((r) => r.data),

  changeRole: (id: string, role: Role) =>
    http.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`/users/${id}`).then((r) => r.data),
}
