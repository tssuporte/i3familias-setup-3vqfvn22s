import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFamily } from '@/contexts/FamilyContext'
import pb from '@/lib/pocketbase/client'
import {
  getChildTasks,
  createChildTask,
  completeChildTask,
  getWeekLeader,
} from '@/services/tasksService'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ChildTaskCard } from '@/components/tasks/ChildTaskCard'
import { CreateChildTaskDialog } from '@/components/tasks/CreateChildTaskDialog'
import { WeekLeaderPanel } from '@/components/tasks/WeekLeaderPanel'
import { Loader2, ArrowRight } from 'lucide-react'

export default function Tasks() {
  const { family } = useFamily() as any
  const { toast } = useToast()

  const [children, setChildren] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [weekLeader, setWeekLeader] = useState<any>(null)

  const [selectedChild, setSelectedChild] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadData = async () => {
    if (!family?.id) return
    setIsLoading(true)
    try {
      const [membersRes, tasksRes, leaderRes] = await Promise.all([
        pb
          .collection('family_members')
          .getFullList({ filter: `family_id = "${family.id}" && member_type = "child"` }),
        getChildTasks(family.id),
        getWeekLeader(family.id),
      ])
      setChildren(membersRes)
      setTasks(tasksRes)
      setWeekLeader(leaderRes)
      if (membersRes.length > 0 && !selectedChild) {
        setSelectedChild(membersRes[0].id)
      }
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
      await createChildTask({ ...data, family_id: family.id })
      toast({ title: 'Tarefa criada com sucesso!' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao criar tarefa', description: err.message, variant: 'destructive' })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string, photoUrl?: string) => {
    setIsActionLoading(true)
    try {
      await completeChildTask(taskId, photoUrl)
      toast({ title: 'Tarefa concluída!', description: 'Estrelas adicionadas com sucesso.' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao concluir tarefa', description: err.message, variant: 'destructive' })
    } finally {
      setIsActionLoading(false)
    }
  }

  const filteredTasks = tasks.filter((t) => t.assigned_to === selectedChild)
  const isSelectedChildLeader = weekLeader?.leader_id === selectedChild

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas das Crianças</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="flex-1 sm:flex-none">
            <Link to="/app/tasks/adult">
              Ver Adultos <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <CreateChildTaskDialog
            childrenMembers={children}
            onCreate={handleCreateTask}
            isLoading={isActionLoading}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : children.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-card text-muted-foreground">
          Nenhuma criança cadastrada na família. Crie perfis para começar a adicionar tarefas.
        </div>
      ) : (
        <>
          <Tabs value={selectedChild} onValueChange={setSelectedChild} className="w-full">
            <TabsList className="mb-6 h-auto p-1 flex-wrap w-full justify-start overflow-x-auto">
              {children.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="py-2 px-6">
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isSelectedChildLeader && (
            <WeekLeaderPanel leaderId={selectedChild} weekLeaderRecordId={weekLeader?.id} />
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg bg-card text-muted-foreground">
              Nenhuma tarefa encontrada para esta criança.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredTasks.map((task) => (
                <ChildTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  isLoading={isActionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
