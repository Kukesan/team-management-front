import { http } from '@/lib/http'
import type { PagedResult, Role, User, UserListItemResponse } from '@/types'

export interface InviteUserRequest {
  name: string
  email: string
  role: Role
}

const ROLE_PRIORITY: Role[] = ['Admin', 'Manager', 'TeamMember']

/** Backend returns `fullName` + `roles[]`; the app works with `name` + a single `role`. */
function mapUser(dto: UserListItemResponse): User {
  const role = ROLE_PRIORITY.find((r) => dto.roles.includes(r)) ?? dto.roles[0]
  return {
    id: dto.id,
    email: dto.email,
    name: dto.fullName,
    role,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
  }
}

export const usersApi = {
  // Backend may return either a raw array or a paged envelope ({ items, ... });
  // normalize here so every caller can keep treating the result as User[].
  list: () =>
    http.get<UserListItemResponse[] | PagedResult<UserListItemResponse>>('/users').then((r) =>
      (Array.isArray(r.data) ? r.data : r.data.items).map(mapUser),
    ),

  invite: (body: InviteUserRequest) => http.post<User>('/users/invite', body).then((r) => r.data),

  changeRole: (id: string, role: Role) =>
    http.post<UserListItemResponse>(`/users/${id}/role`, { role }).then((r) => mapUser(r.data)),

  remove: (id: string) => http.delete<void>(`/users/${id}`).then((r) => r.data),
}
