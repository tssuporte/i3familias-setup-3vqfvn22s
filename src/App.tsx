import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/hooks/use-theme'
import { AuthProvider } from '@/hooks/use-auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MainLayout } from '@/components/layouts/MainLayout'
import { KioskLayout } from '@/components/layouts/KioskLayout'
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute'
import { FamilyProvider, FamilyRequire } from '@/contexts/FamilyContext'
import NotFound from './pages/NotFound'

// Public Pages
const Index = lazy(() => import('./pages/Index'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))

// App Pages
const Onboarding = lazy(() => import('./pages/app/Onboarding'))
const ChildView = lazy(() => import('./pages/app/ChildView'))
const Dashboard = lazy(() => import('./pages/app/Dashboard'))
const Tasks = lazy(() => import('./pages/app/Tasks'))
const AdultTasks = lazy(() => import('./pages/app/AdultTasks'))
const Pantry = lazy(() => import('./pages/app/Pantry'))
const Meals = lazy(() => import('./pages/app/Meals'))
const Shopping = lazy(() => import('./pages/app/Shopping'))
const Calendar = lazy(() => import('./pages/app/Calendar'))
const Studies = lazy(() => import('./pages/app/Studies'))
const Finances = lazy(() => import('./pages/app/Finances'))
const Notices = lazy(() => import('./pages/app/Notices'))
const Reports = lazy(() => import('./pages/app/Reports'))
const Settings = lazy(() => import('./pages/app/Settings'))
const Assistant = lazy(() => import('./pages/app/Assistant'))
const Rewards = lazy(() => import('./pages/app/Rewards'))
const RewardsPending = lazy(() => import('./pages/app/RewardsPending'))

// Kiosk
const Kiosk = lazy(() => import('./pages/Kiosk'))
const KioskTasks = lazy(() => import('./pages/kiosk/Tasks'))
const KioskProfile = lazy(() => import('./pages/kiosk/Profile'))
const KioskMeals = lazy(() => import('./pages/kiosk/Meals'))

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="family-hub-theme">
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={null}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />

                {/* Protected App Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <FamilyProvider>
                        <Outlet />
                      </FamilyProvider>
                    </ProtectedRoute>
                  }
                >
                  <Route path="/app/onboarding" element={<Onboarding />} />
                  <Route
                    element={
                      <FamilyRequire>
                        <MainLayout />
                      </FamilyRequire>
                    }
                  >
                    <Route path="/app" element={<Dashboard />} />
                    <Route path="/app/tasks" element={<Tasks />} />
                    <Route path="/app/tasks/adult" element={<AdultTasks />} />
                    <Route path="/app/pantry" element={<Pantry />} />
                    <Route path="/app/meals" element={<Meals />} />
                    <Route path="/app/shopping" element={<Shopping />} />
                    <Route path="/app/calendar" element={<Calendar />} />
                    <Route path="/app/studies" element={<Studies />} />
                    <Route path="/app/finances" element={<Finances />} />
                    <Route path="/app/notices" element={<Notices />} />
                    <Route path="/app/reports" element={<Reports />} />
                    <Route path="/app/settings" element={<Settings />} />
                    <Route path="/app/assistant" element={<Assistant />} />
                    <Route path="/app/rewards" element={<Rewards />} />
                    <Route path="/app/rewards/pending" element={<RewardsPending />} />
                    <Route path="/app/child/:memberId" element={<ChildView />} />
                  </Route>
                </Route>

                {/* Protected Kiosk Route */}
                <Route
                  element={
                    <ProtectedRoute>
                      <KioskLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/kiosk" element={<Kiosk />} />
                  <Route path="/kiosk/tasks" element={<KioskTasks />} />
                  <Route path="/kiosk/profile" element={<KioskProfile />} />
                  <Route path="/kiosk/meals" element={<KioskMeals />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
)

export default App
