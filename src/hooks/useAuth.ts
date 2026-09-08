import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/features/auth/authStore'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  const updateUser = useAuthStore((s) => s.updateUser)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await authApi.login(body)
      setSession(res.token, res.user)
      navigate('/', { replace: true })
    },
    [setSession, navigate],
  )

  const register = useCallback(
    async (body: RegisterRequest) => {
      const res = await authApi.register(body)
      setSession(res.token, res.user)
      navigate('/', { replace: true })
    },
    [setSession, navigate],
  )

  const logout = useCallback(() => {
    clearSession()
    navigate('/login', { replace: true })
  }, [clearSession, navigate])

  return {
    token,
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  }
}

export function useRole() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? null
  return {
    role,
    isManager: role === 'Manager',
    isAdmin: role === 'Admin',
    isManagerOrAdmin: role === 'Manager' || role === 'Admin',
    isTeamMember: role === 'TeamMember',
  }
}
