import { http } from '@/lib/http'
import type { AuthResponse, AuthUserResponse, LoginRequest, RegisterRequest, Role, User } from '@/types'

const ROLE_PRIORITY: Role[] = ['Admin', 'Manager', 'TeamMember']

/** Backend returns `fullName` + `roles[]`; the app works with `name` + a single `role`. */
function mapAuthUser(dto: AuthUserResponse): User {
  const role = ROLE_PRIORITY.find((r) => dto.roles.includes(r)) ?? dto.roles[0]
  return {
    id: dto.id,
    email: dto.email,
    name: dto.fullName,
    role,
    isActive: true,
    createdAt: '',
  }
}

async function mapLoginResponse(res: AuthResponse) {
  return { token: res.token, user: mapAuthUser(res.user) }
}

export const authApi = {
  login: (body: LoginRequest) =>
    http.post<AuthResponse>('/auth/login', body).then((r) => mapLoginResponse(r.data)),

  register: (body: RegisterRequest) =>
    http.post<AuthResponse>('/auth/register', body).then((r) => mapLoginResponse(r.data)),

  me: () => http.get<AuthUserResponse>('/auth/me').then((r) => mapAuthUser(r.data)),
}
