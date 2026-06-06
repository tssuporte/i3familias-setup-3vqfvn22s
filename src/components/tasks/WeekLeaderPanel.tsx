import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPendingConfirmations, confirmSiblingTask } from '@/services/tasksService'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert, Check } from 'lucide-react'

export function WeekLeaderPanel({ leaderId, weekLeaderRecordId }: any) {
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
    <Card className="mb-6 border-yellow-400 bg-yellow-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <ShieldAlert className="w-5 h-5" /> Líder da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        {confirmations.length === 0 ? (
          <p className="text-sm text-yellow-700">
            Nenhuma tarefa pendente de confirmação de seus irmãos no momento.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-yellow-800">
              Você tem {confirmations.length} tarefas de irmãos para validar:
            </p>
            <div className="grid gap-2">
              {confirmations.map((conf) => (
                <div
                  key={conf.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-md shadow-sm border border-yellow-200"
                >
                  <div className="mb-2 sm:mb-0">
                    <span className="font-medium block">{conf.expand?.task_id?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      de {conf.expand?.sibling_id?.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(conf.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-none"
                  >
                    <Check className="w-4 h-4 mr-1" /> Validar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
