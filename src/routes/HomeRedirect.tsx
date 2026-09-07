import { Navigate } from 'react-router-dom'
import { useRole } from '@/hooks/useAuth'

export function HomeRedirect() {
  const { isManagerOrAdmin } = useRole()
  return <Navigate to={isManagerOrAdmin ? '/dashboard' : '/reports'} replace />
}
