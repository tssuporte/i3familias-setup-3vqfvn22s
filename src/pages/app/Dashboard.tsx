import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useFamily } from '@/contexts/FamilyContext'
import {
  CheckCircle2,
  ShoppingBasket,
  BellRing,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const { family } = useFamily()

  const [loading, setLoading] = useState(true)
  const [pendingTasksCount, setPendingTasksCount] = useState(0)
  const [shoppingCount, setShoppingCount] = useState(0)
  const [noticesCount, setNoticesCount] = useState(0)
  const [agenda, setAgenda] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])

  const loadData = async () => {
    if (!family?.id) return
    setLoading(true)
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd')

      const [tasksRes, shoppingRes, noticesRes, agendaRes, activityRes, childrenRes] =
        await Promise.all([
          pb.collection('tasks_children').getFullList({
            filter: `family_id = "${family.id}" && status = "pending"`,
            $autoCancel: false,
          }),
          pb.collection('shopping_items').getFullList({
            filter: `family_id = "${family.id}" && is_purchased = false`,
            $autoCancel: false,
          }),
          pb.collection('family_notices').getFullList({
            filter: `family_id = "${family.id}" && status = "active"`,
            $autoCancel: false,
          }),
          pb.collection('calendar_events').getFullList({
            filter: `family_id = "${family.id}" && date >= "${todayStr} 00:00:00"`,
            sort: 'date',
            $autoCancel: false,
          }),
          pb.collection('tasks_children').getFullList({
            filter: `family_id = "${family.id}" && status = "completed"`,
            sort: '-completed_at',
            $autoCancel: false,
          }),
          pb.collection('family_members').getFullList({
            filter: `family_id = "${family.id}" && member_type = "child"`,
            sort: 'name',
            $autoCancel: false,
          }),
        ])

      setPendingTasksCount(tasksRes.length)
      setShoppingCount(shoppingRes.length)
      setNoticesCount(noticesRes.length)
      setAgenda(agendaRes.slice(0, 3))
      setRecentActivity(activityRes.slice(0, 3))
      setChildren(childrenRes)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [family?.id])

  useRealtime('tasks_children', () => {
    loadData()
  })
  useRealtime('shopping_items', () => {
    loadData()
  })
  useRealtime('family_notices', () => {
    loadData()
  })
  useRealtime('calendar_events', () => {
    loadData()
  })

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMM", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: ptBR })
    } catch {
      return 'recentemente'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name || 'Família'}!</h1>
          <p className="text-muted-foreground">Aqui está o resumo do seu dia.</p>
        </div>

        {children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/app/child/${child.id}`}
                className="flex items-center gap-2 bg-card border rounded-full pl-1 pr-3 py-1 hover:bg-secondary hover:border-primary/30 transition-all group"
              >
                <Avatar className="h-7 w-7 border bg-muted">
                  <AvatarImage src={child.photo_url} />
                  <AvatarFallback className="text-[10px] font-bold">
                    {child.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium whitespace-nowrap group-hover:text-primary transition-colors">
                  {child.name}
                </span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:text-primary -ml-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{pendingTasksCount}</div>
            )}
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <p className="text-xs text-muted-foreground">Para serem feitas</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Falta</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{shoppingCount}</div>
            )}
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <p className="text-xs text-muted-foreground">Na lista de compras</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos Ativos</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{noticesCount}</div>
            )}
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <p className="text-xs text-muted-foreground">Para toda a família</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Agenda da Semana</CardTitle>
            <CardDescription>Seus próximos compromissos familiares.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : agenda.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <span className="text-sm text-muted-foreground">
                  Nenhum evento agendado para hoje ou próximos dias.
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {agenda.map((event) => (
                  <div key={event.id} className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.date)} {event.time && `às ${event.time}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Tarefas concluídas recentemente.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <span className="text-sm text-muted-foreground">
                  Nenhuma atividade recente encontrada.
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((task) => (
                  <div key={task.id} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">Tarefa concluída</p>
                      <p className="text-sm text-muted-foreground">{task.name}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(task.completed_at || task.updated)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
