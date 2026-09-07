import axios, { AxiosError } from 'axios'
import { getAuthToken, useAuthStore } from '@/features/auth/authStore'
import type { ApiError } from '@/types'

// ASSUMPTION: backend is mounted at {VITE_API_BASE_URL}/api/... — set VITE_API_BASE_URL
// in a .env.local file. Falls back to a same-origin /api path (see the dev proxy in vite.config.ts).
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register']

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path))

    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().clearSession()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const apiError: ApiError = {
      message:
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        'Something went wrong',
      status: error.response?.status ?? 0,
      errors: (error.response?.data as { errors?: Record<string, string[]> } | undefined)?.errors,
    }

    return Promise.reject(apiError)
  },
)
