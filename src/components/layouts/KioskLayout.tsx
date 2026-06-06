import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function KioskLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showSidebarTrigger={false} />
      <main className="flex-1 animate-fade-in p-4 md:p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
