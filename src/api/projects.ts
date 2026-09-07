import { http } from '@/lib/http'
import type { PagedResult, Project } from '@/types'

export interface SaveProjectRequest {
  name: string
  description?: string
  isActive: boolean
}

export const projectsApi = {
  // Backend may return either a raw array or a paged envelope ({ items, ... });
  // normalize here so every caller can keep treating the result as Project[].
  list: () =>
    http.get<Project[] | PagedResult<Project>>('/projects').then((r) =>
      Array.isArray(r.data) ? r.data : r.data.items,
    ),

  create: (body: SaveProjectRequest) => http.post<Project>('/projects', body).then((r) => r.data),

  update: (id: string, body: SaveProjectRequest) =>
    http.put<Project>(`/projects/${id}`, body).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`/projects/${id}`).then((r) => r.data),
}
