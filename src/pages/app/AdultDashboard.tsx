import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Star, CheckCircle, TrendingUp, Gift, Clock, Trophy, ArrowRight } from 'lucide-react'
import { useDashboard, DateRange } from '@/hooks/use-dashboard'
import { useFamily } from '@/contexts/FamilyContext'

const DashboardCharts = lazy(() => import('@/components/dashboard/DashboardCharts'))

export default function AdultDashboard() {
  const navigate = useNavigate()
  const { family } = useFamily()
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
  } = useDashboard(dateRange, family?.id ?? '')

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Painel do Adulto</h1>
          <p className="text-muted-foreground">Monitore o progresso e atividades da família.</p>
        </div>

        <div className="flex flex-row gap-2">
          <Button
            variant={dateRange === 'week' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-md"
            onClick={() => setDateRange('week')}
          >
            Esta Semana
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-md"
            onClick={() => setDateRange('month')}
          >
            Este Mês
          </Button>
          <Button
            variant={dateRange === 'all' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-md"
            onClick={() => setDateRange('all')}
          >
            Todo o Tempo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[160px] rounded-xl" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="p-6 rounded-lg shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <div className="flex flex-col">
                <Star className="h-8 w-8 opacity-50 mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary">{totalStars}</div>
                <p className="text-sm text-muted-foreground mt-2">Total de Estrelas</p>
              </div>
            </Card>

            <Card
              className="p-6 rounded-lg shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '50ms' }}
            >
              <div className="flex flex-col">
                <CheckCircle className="h-8 w-8 opacity-50 mb-4 text-green-500" />
                <div className="text-3xl font-bold text-primary">{completedTasksCount}</div>
                <p className="text-sm text-muted-foreground mt-2">Tarefas Concluídas</p>
              </div>
            </Card>

            <Card
              className="p-6 rounded-lg shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="flex flex-col">
                <TrendingUp className="h-8 w-8 opacity-50 mb-4 text-blue-500" />
                <div className="text-3xl font-bold text-primary">{completionRate}%</div>
                <p className="text-sm text-muted-foreground mt-2">Taxa de Conclusão</p>
              </div>
            </Card>

            <Card
              className="p-6 rounded-lg shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              <div className="flex flex-col">
                <Gift className="h-8 w-8 opacity-50 mb-4 text-orange-500" />
                <div className="text-3xl font-bold text-primary">{redeemedRewards}</div>
                <p className="text-sm text-muted-foreground mt-2">Recompensas</p>
              </div>
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
            <Card
              className="p-6 rounded-lg shadow-sm border animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 opacity-70" />
                  Tarefas Próximas
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  As próximas 5 tarefas pendentes
                </p>
              </div>

              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma tarefa pendente.
                </p>
              ) : (
                <div className="flex flex-col">
                  {upcomingTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-secondary transition-colors duration-150 rounded-md px-2 -mx-2 gap-4"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Resp: {task.expand?.assigned_to?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {task.due_time ? `${task.due_time}h` : '-'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          {task.stars_value || 0}{' '}
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              className="p-6 rounded-lg shadow-sm border animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 opacity-70" />
                  Crianças Mais Ativas
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Top 3 baseadas em estrelas ganhas
                </p>
              </div>

              {mostActiveChildren.filter((c: any) => c.stars > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma atividade registrada.
                </p>
              ) : (
                <div className="flex flex-col">
                  {mostActiveChildren
                    .filter((c: any) => c.stars > 0)
                    .map((child: any, index: number) => {
                      const targetId = child.id || child.member_id
                      return (
                        <div
                          key={targetId || child.name}
                          onClick={() => targetId && navigate(`/app/child/${targetId}`)}
                          className={`flex items-center justify-between py-3 border-b last:border-0 hover:bg-secondary transition-colors duration-150 rounded-md px-2 -mx-2 gap-4 ${targetId ? 'cursor-pointer group' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm ${targetId ? 'group-hover:bg-primary group-hover:text-primary-foreground transition-colors' : ''}`}
                            >
                              {index + 1}
                            </div>
                            <p
                              className={`text-sm font-bold ${targetId ? 'group-hover:text-primary transition-colors' : ''}`}
                            >
                              {child.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-md">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-sm font-bold">{child.stars}</span>
                            </div>
                            {targetId && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -ml-2" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
