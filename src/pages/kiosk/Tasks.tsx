import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'

export default function KioskTasks() {
  return (
    <KioskPageLayout title="Tarefas Diárias">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold text-muted-foreground">Lista de Tarefas</h2>
        <p className="text-xl text-muted-foreground/70">
          Em breve você poderá gerenciar as tarefas por aqui.
        </p>
      </div>
    </KioskPageLayout>
  )
}
