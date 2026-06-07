import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NotificationProvider } from '@/hooks/use-notifications'

export function MainLayout() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 animate-fade-in">
            <div className="mx-auto max-w-7xl p-4 md:p-8">
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NotificationProvider>
  )
}
