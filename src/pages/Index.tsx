import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Index() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
          <span className="text-xl font-semibold">Family Hub</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
              Bem-vindo ao <span className="text-primary">Family Hub</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              A plataforma inteligente para a gestão da sua casa. Centralize tarefas, compras,
              eventos e muito mais em um só lugar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              <Link to="/auth/login">Entrar</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base"
            >
              <Link to="/auth/signup">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
