import { Navigate } from 'react-router-dom'
import { getAuthSession, type UserRole } from '@/lib/authStorage'

type RequireAuthProps = {
  children: React.ReactNode
  role?: UserRole
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const session = getAuthSession()
  if (!session) return <Navigate to="/user-select" replace />
  if (role && session.role !== role) return <Navigate to="/home" replace />
  return children
}
