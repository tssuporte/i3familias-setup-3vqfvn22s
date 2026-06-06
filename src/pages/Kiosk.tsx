import { useAuth } from '@/hooks/use-auth'

export default function Kiosk() {
  const { user } = useAuth()

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-8">
      <h1 className="text-6xl font-bold text-primary text-center">Family Hub</h1>
      <p className="text-2xl text-muted-foreground text-center">
        Modo Quiosque ativo para a família {user?.name}.
      </p>
      <div className="w-full max-w-2xl rounded-2xl bg-card p-12 shadow-elevation text-center">
        <p className="text-4xl font-medium">Nenhum aviso urgente.</p>
        <p className="text-xl text-muted-foreground mt-4">Tenha um ótimo dia!</p>
      </div>
    </div>
  )
}
