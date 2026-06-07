import { lazy, Suspense, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Star, CheckCircle, TrendingUp, Gift, Clock, Trophy } from 'lucide-react'
import { useDashboard, DateRange } from '@/hooks/use-dashboard'

const DashboardCharts = lazy(() => import('@/components/dashboard/DashboardCharts'))

export default function AdultDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const { toast } = useToast()

  const {
    loading,
    error,
    totalStars,
    completedTasksCount,
    completionRate,
    redeemedRewards,
    starsPerChild,
    tasksPerType,
    activityWeekly,
    upcomingTasks,
    mostActiveChildren,
    isEmpty,
  } = useDashboard(dateRange)

  useEffect(() => {
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'destructive',
      })
    }
  }, [error, toast])

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel do Adulto</h1>
          <p className="text-muted-foreground">Monitore o progresso e atividades da família.</p>
        </div>

        <Select value={dateRange} onValueChange={(val: DateRange) => setDateRange(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="all">Todo o Tempo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="bg-muted p-4 rounded-full mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum dado disponível</h3>
          <p className="text-muted-foreground max-w-sm">
            A família ainda não possui tarefas ou atividades registradas neste período.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Estrelas</CardTitle>
                <Star className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStars}</div>
                <p className="text-xs text-muted-foreground">Ganhas no período</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasksCount}</div>
                <p className="text-xs text-muted-foreground">Realizadas com sucesso</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">Das tarefas atribuídas</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recompensas</CardTitle>
                <Gift className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{redeemedRewards}</div>
                <p className="text-xs text-muted-foreground">Resgatadas e aprovadas</p>
              </CardContent>
            </Card>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[300px] rounded-xl" />
                ))}
              </div>
            }
          >
            <DashboardCharts
              starsPerChild={starsPerChild}
              tasksPerType={tasksPerType}
              activityWeekly={activityWeekly}
            />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Tarefas Próximas
                </CardTitle>
                <CardDescription>As próximas 5 tarefas pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma tarefa pendente.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingTasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{task.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Resp: {task.expand?.assigned_to?.name || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold">
                            {task.due_time ? `${task.due_time}h` : '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.stars_value || 0} ⭐
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  Crianças Mais Ativas
                </CardTitle>
                <CardDescription>Top 3 baseadas em estrelas ganhas</CardDescription>
              </CardHeader>
              <CardContent>
                {mostActiveChildren.filter((c: any) => c.stars > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma atividade registrada.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {mostActiveChildren
                      .filter((c: any) => c.stars > 0)
                      .map((child: any, index: number) => (
                        <div
                          key={child.name}
                          className="flex items-center justify-between bg-muted/30 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <p className="font-medium">{child.name}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-md">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-sm font-bold">{child.stars}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
