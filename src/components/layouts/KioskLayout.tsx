import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { useKioskTimeout } from '@/hooks/use-kiosk-timeout'

export function KioskLayout() {
  useKioskTimeout()

  return (
    <div className="flex min-h-screen flex-col bg-primary/5">
      <main className="flex-1 animate-fade-in p-4 md:p-8 flex flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
