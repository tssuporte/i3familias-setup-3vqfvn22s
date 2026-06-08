import { useEffect, useState } from 'react'
import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'
import { ChildTaskCard } from '@/components/tasks/ChildTaskCard'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Star } from 'lucide-react'
import { completeChildTask, getPendingChildTasks } from '@/services/tasks'
import { useSearchParams } from 'react-router-dom'

export default function KioskTasks() {
  const [searchParams] = useSearchParams()
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [showReward, setShowReward] = useState(false)
  const { toast } = useToast()

  const memberId = searchParams.get('memberId') || ''

  const loadTasks = async () => {
    if (!memberId) {
      setIsLoading(false)
      return
    }
    try {
      const data = await getPendingChildTasks(memberId)
      setTasks(data)
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao carregar tarefas', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [memberId])

  useRealtime('tasks_children', () => {
    loadTasks()
  })

  const handleComplete = async (taskId: string, photo: string) => {
    try {
      setCompletingId(taskId)
      await completeChildTask(taskId, photo)
      setShowReward(true)
      setTimeout(() => setShowReward(false), 3000)
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao concluir tarefa', variant: 'destructive' })
    } finally {
      setCompletingId(null)
    }
  }

  if (!memberId) {
    return (
      <KioskPageLayout title="Tarefas Diárias">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mt-20">
          <p className="text-2xl text-muted-foreground/70">
            Selecione um perfil primeiro para ver suas tarefas.
          </p>
        </div>
      </KioskPageLayout>
    )
  }

  return (
    <KioskPageLayout title="Tarefas Diárias">
      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <Star className="w-48 h-48 text-yellow-400 fill-yellow-400 animate-bounce drop-shadow-2xl" />
            <h2 className="text-5xl font-bold text-white mt-8 drop-shadow-lg">Muito bem!</h2>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full pb-10">
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-16 bg-card rounded-2xl shadow-sm border border-border mt-10">
            <Star className="w-24 h-24 text-yellow-400 fill-yellow-400 opacity-80" />
            <h2 className="text-4xl font-bold text-foreground">Tudo pronto!</h2>
            <p className="text-2xl text-muted-foreground">
              Você não tem tarefas pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {tasks.map((task) => (
              <ChildTaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                isLoading={completingId === task.id}
              />
            ))}
          </div>
        )}
      </div>
    </KioskPageLayout>
  )
}
