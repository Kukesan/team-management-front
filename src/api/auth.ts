import { http } from '@/lib/http'
import type {
  AuthResponse,
  AuthUserResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  Role,
  UpdateProfileRequest,
  User,
} from '@/types'

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

  // ASSUMPTION: no endpoint spec was given for self-service profile/password
  // updates; guessed as PATCH /auth/me and POST /auth/change-password to
  // mirror the existing /auth/me and /auth/login conventions above.
  updateProfile: (body: UpdateProfileRequest) =>
    http.patch<AuthUserResponse>('/auth/me', body).then((r) => mapAuthUser(r.data)),

  changePassword: (body: ChangePasswordRequest) =>
    http.post<void>('/auth/change-password', body).then((r) => r.data),
}
