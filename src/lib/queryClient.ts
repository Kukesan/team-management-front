import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

/** Central place for query key factories so invalidations stay in sync across features. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  reports: {
    mine: (params?: unknown) => ['reports', 'mine', params] as const,
    team: (params?: unknown) => ['reports', 'team', params] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
    versions: (id: string) => ['reports', 'versions', id] as const,
  },
  projects: {
    list: ['projects', 'list'] as const,
  },
  users: {
    list: ['users', 'list'] as const,
  },
  dashboard: {
    summary: (filters?: unknown) => ['dashboard', 'summary', filters] as const,
    trend: (filters?: unknown) => ['dashboard', 'trend', filters] as const,
    statusByMember: (filters?: unknown) => ['dashboard', 'status-by-member', filters] as const,
    workloadByProject: (filters?: unknown) => ['dashboard', 'workload-by-project', filters] as const,
    timeByTaskType: (filters?: unknown) => ['dashboard', 'time-by-task-type', filters] as const,
    activity: ['dashboard', 'activity'] as const,
  },
  ai: {
    summary: (params?: unknown) => ['ai', 'summary', params] as const,
  },
}
