import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function MemberRoute() {
  const { isMemberAccount, memberAccountRole, memberAccountMemberId, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (isMemberAccount && memberAccountRole === 'child' && memberAccountMemberId) {
    const allowedPaths = ['/app', '/app/tasks', '/app/studies', '/app/rewards']

    const isChildProfile = location.pathname === `/app/child/${memberAccountMemberId}`
    const isAllowedExact = allowedPaths.includes(location.pathname)

    if (!isAllowedExact && !isChildProfile) {
      return <Navigate to={`/app/child/${memberAccountMemberId}`} replace />
    }
  }

  return <Outlet />
}
