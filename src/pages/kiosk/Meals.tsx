import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'

export default function KioskMeals() {
  return (
    <KioskPageLayout title="Cardápio do Dia">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold text-muted-foreground">Detalhes do Cardápio</h2>
        <p className="text-xl text-muted-foreground/70">
          Acompanhe as refeições planejadas para hoje.
        </p>
      </div>
    </KioskPageLayout>
  )
}
