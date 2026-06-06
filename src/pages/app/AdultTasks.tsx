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

import { cn } from '@/lib/utils'

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
    <div className="max-w-4xl mx-auto p-8 space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed'
            return (
              <Card
                key={task.id}
                className={cn(
                  'cursor-pointer transition-transform duration-200 active:scale-[0.98] border-0 border-l-4 border-l-primary rounded-lg overflow-hidden shadow-sm',
                  isOverdue
                    ? 'bg-destructive/10 hover:bg-destructive/20'
                    : 'bg-card hover:bg-secondary',
                )}
              >
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{task.name}</span>
                      {task.priority === 'high' && (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800 hover:bg-red-100 border-none"
                        >
                          Alta
                        </Badge>
                      )}
                      {task.priority === 'medium' && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none"
                        >
                          Média
                        </Badge>
                      )}
                      {task.priority === 'low' && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none"
                        >
                          Baixa
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
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3 py-1"
                      >
                        Concluída
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleComplete(task.id)}
                        disabled={isActionLoading}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      >
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
