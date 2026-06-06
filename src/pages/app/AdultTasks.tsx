import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFamily } from '@/contexts/FamilyContext'
import pb from '@/lib/pocketbase/client'
import { getAdultTasks, createAdultTask, completeAdultTask } from '@/services/tasksService'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Calendar, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateAdultTaskDialog } from '@/components/tasks/CreateAdultTaskDialog'

export default function AdultTasks() {
  const { family } = useFamily() as any
  const { toast } = useToast()

  const [adults, setAdults] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [filterMember, setFilterMember] = useState<string>('all')

  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadData = async () => {
    if (!family?.id) return
    setIsLoading(true)
    try {
      const [membersRes, tasksRes] = await Promise.all([
        pb
          .collection('family_members')
          .getFullList({ filter: `family_id = "${family.id}" && member_type = "adult"` }),
        getAdultTasks(family.id),
      ])
      setAdults(membersRes)
      setTasks(tasksRes)
    } catch (err: any) {
      toast({ title: 'Erro ao carregar dados', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [family?.id])

  const handleCreateTask = async (data: any) => {
    setIsActionLoading(true)
    try {
      await createAdultTask({ ...data, family_id: family.id })
      toast({ title: 'Tarefa criada com sucesso!' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao criar tarefa', description: err.message, variant: 'destructive' })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async (id: string) => {
    setIsActionLoading(true)
    try {
      await completeAdultTask(id)
      toast({ title: 'Tarefa concluída!' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao concluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredTasks =
    filterMember === 'all' ? tasks : tasks.filter((t) => t.assigned_to === filterMember)

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas de Adultos</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="flex-1 sm:flex-none">
            <Link to="/app/tasks">
              <ArrowLeft className="w-4 h-4 mr-2" /> Ver Crianças
            </Link>
          </Button>
          <CreateAdultTaskDialog
            adults={adults}
            onCreate={handleCreateTask}
            isLoading={isActionLoading}
          />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Select value={filterMember} onValueChange={setFilterMember}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Adultos</SelectItem>
            {adults.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-card text-muted-foreground">
          Nenhuma tarefa de adulto encontrada.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((task) => {
            const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed'
            return (
              <Card key={task.id} className={isOverdue ? 'border-red-300 bg-red-50/20' : ''}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{task.name}</span>
                      {task.priority === 'high' && (
                        <Badge variant="destructive">Alta Prioridade</Badge>
                      )}
                      {task.priority === 'medium' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Média
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Para: {task.expand?.assigned_to?.name}
                      </span>
                      {task.due_date && (
                        <span
                          className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}
                        >
                          <Calendar className="w-4 h-4" />{' '}
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {task.status === 'completed' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-sm py-1.5 px-3"
                      >
                        Concluída
                      </Badge>
                    ) : (
                      <Button onClick={() => handleComplete(task.id)} disabled={isActionLoading}>
                        Marcar Concluída
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
