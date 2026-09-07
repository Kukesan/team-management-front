import { Navigate, Outlet } from 'react-router-dom'
import { useRole } from '@/hooks/useAuth'
import type { Role } from '@/types'

interface RoleRouteProps {
  allow: Role[]
}

export function RoleRoute({ allow }: RoleRouteProps) {
  const { role } = useRole()

  if (!role || !allow.includes(role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
