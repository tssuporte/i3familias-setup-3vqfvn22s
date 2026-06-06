import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6 bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
