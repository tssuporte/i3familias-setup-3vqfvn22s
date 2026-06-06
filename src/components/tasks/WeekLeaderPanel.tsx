import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPendingConfirmations, confirmSiblingTask } from '@/services/tasksService'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert, Check } from 'lucide-react'

export function WeekLeaderPanel({ leaderId, weekLeaderRecordId, leader }: any) {
  const [confirmations, setConfirmations] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (weekLeaderRecordId) {
      getPendingConfirmations(weekLeaderRecordId).then(setConfirmations).catch(console.error)
    }
  }, [weekLeaderRecordId])

  const handleConfirm = async (confId: string) => {
    try {
      await confirmSiblingTask(confId)
      setConfirmations((prev) => prev.filter((c) => c.id !== confId))
      if (confirmations.length === 1) {
        toast({
          title: 'Sucesso!',
          description: 'Todas as tarefas confirmadas! Estrelas bônus ganhas!',
        })
      } else {
        toast({ title: 'Tarefa confirmada!' })
      }
    } catch (err) {
      toast({ title: 'Erro ao confirmar', variant: 'destructive' })
    }
  }

  if (!weekLeaderRecordId) return null

  return (
    <Card className="mb-6 bg-accent border-none p-8 rounded-xl shadow-sm">
      <div className="flex flex-col items-center mb-6">
        <img
          src={
            leader?.photo_url ||
            `https://img.usecurling.com/ppl/thumbnail?seed=${leader?.id || '1'}`
          }
          alt={leader?.name}
          className="w-[80px] h-[80px] rounded-full object-cover border-4 border-background shadow-sm"
        />
        <h3 className="text-lg font-semibold mt-3">{leader?.name}</h3>
        <div className="text-xl font-bold flex items-center gap-2 mt-1 text-primary">
          <ShieldAlert className="w-6 h-6" /> Líder da Semana
        </div>
      </div>

      {confirmations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">
          Nenhuma tarefa pendente de confirmação no momento.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-center">
            Você tem {confirmations.length} tarefas para validar:
          </p>
          <div className="grid gap-3">
            {confirmations.map((conf) => (
              <div
                key={conf.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded-lg shadow-sm border"
              >
                <div className="mb-3 sm:mb-0">
                  <span className="font-semibold text-lg block">{conf.expand?.task_id?.name}</span>
                  <span className="text-sm text-muted-foreground block">
                    de {conf.expand?.sibling_id?.name}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleConfirm(conf.id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 h-auto"
                >
                  <Check className="w-4 h-4 mr-2" /> Confirmar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
