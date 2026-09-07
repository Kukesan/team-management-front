import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/types'

/**
 * Session state only — server data (reports, projects, users, etc.) always
 * lives in React Query, never here.
 *
 * TRADEOFF: the JWT is persisted to localStorage so a page refresh doesn't
 * log the user out. That means the token is readable by any script running
 * on the page (XSS risk). The more defensible approach is an httpOnly refresh
 * cookie issued by the backend plus a short-lived in-memory access token —
 * swap to that once the backend exposes a /auth/refresh endpoint that sets
 * such a cookie; until then this is the pragmatic default for an internal tool.
 */
interface AuthState {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: 'wr-auth' },
  ),
)

export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

export function getCurrentRole(): Role | null {
  return useAuthStore.getState().user?.role ?? null
}

export function isManagerOrAdmin(role: Role | null | undefined): boolean {
  return role === 'Manager' || role === 'Admin'
}
