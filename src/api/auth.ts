import { http } from '@/lib/http'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

export const authApi = {
  login: (body: LoginRequest) => http.post<AuthResponse>('/auth/login', body).then((r) => r.data),

  register: (body: RegisterRequest) =>
    http.post<AuthResponse>('/auth/register', body).then((r) => r.data),

  me: () => http.get<User>('/auth/me').then((r) => r.data),
}
