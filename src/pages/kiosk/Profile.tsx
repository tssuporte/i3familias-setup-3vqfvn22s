import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'

export default function KioskProfile() {
  return (
    <KioskPageLayout title="Perfil da Criança">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold text-muted-foreground">Visão do Perfil</h2>
        <p className="text-xl text-muted-foreground/70">
          As informações detalhadas e o progresso estarão disponíveis aqui.
        </p>
      </div>
    </KioskPageLayout>
  )
}
