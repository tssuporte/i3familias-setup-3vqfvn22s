import { useState, useEffect, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  isBefore,
  addDays,
  getWeekOfMonth,
  parseISO,
  isAfter,
} from 'date-fns'
import { Download, AlertTriangle, Clock, AlertCircle } from 'lucide-react'

import { useFamily } from '@/contexts/FamilyContext'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

const chartConfig: ChartConfig = {
  total: { label: 'Total', color: 'hsl(var(--primary))' },
  completed: { label: 'Concluídas', color: 'hsl(var(--chart-2, 160 60% 45%))' },
  overdue: { label: 'Atrasadas', color: 'hsl(var(--destructive))' },
}

export default function Reports() {
  const { family } = useFamily()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMember, setSelectedMember] = useState<string>('all')

  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [stars, setStars] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [pantryAlerts, setPantryAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!family?.id) return

    const loadData = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(new Date(selectedYear, selectedMonth))
        const end = endOfMonth(new Date(selectedYear, selectedMonth))

        const startStr = start.toISOString().replace('T', ' ')
        const endStr = end.toISOString().replace('T', ' ')

        const dateFilter = `created >= "${startStr}" && created <= "${endStr}"`
        const approvedFilter = `approved_at >= "${startStr}" && approved_at <= "${endStr}"`

        const [membersData, childTasks, adultTasks, starsData, redemptionsData, pantryData] =
          await Promise.all([
            pb.collection('family_members').getFullList({ filter: `family_id="${family.id}"` }),
            pb
              .collection('tasks_children')
              .getFullList({
                filter: `family_id="${family.id}" && ${dateFilter}`,
                expand: 'assigned_to',
              }),
            pb
              .collection('tasks_adults')
              .getFullList({
                filter: `family_id="${family.id}" && ${dateFilter}`,
                expand: 'assigned_to',
              }),
            pb
              .collection('stars_transactions')
              .getFullList({
                filter: `family_id="${family.id}" && transaction_type="earned" && ${dateFilter}`,
                expand: 'member_id',
              }),
            pb
              .collection('rewards_redemptions')
              .getFullList({
                filter: `family_id="${family.id}" && status="approved" && ${approvedFilter}`,
                expand: 'member_id,reward_id',
              }),
            pb.collection('pantry').getFullList({ filter: `family_id="${family.id}"` }),
          ])

        setMembers(membersData)
        setTasks([...childTasks, ...adultTasks])
        setStars(starsData)
        setRedemptions(redemptionsData)

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const alertThreshold = addDays(startOfToday, 7)

        const alerts = pantryData
          .filter((item) => {
            const isLowStock = item.quantity < (item.min_stock || 0)
            const isExpiring =
              item.expiry_date &&
              !isAfter(parseISO(item.expiry_date.replace(' ', 'T')), alertThreshold)
            return isLowStock || isExpiring
          })
          .map((item) => {
            const isExpiring =
              item.expiry_date &&
              !isAfter(parseISO(item.expiry_date.replace(' ', 'T')), alertThreshold)
            const isExpired =
              item.expiry_date &&
              isBefore(parseISO(item.expiry_date.replace(' ', 'T')), startOfToday)
            const reasons = []
            if (isExpiring) reasons.push(isExpired ? 'Vencido' : 'Vence em breve')
            if (item.quantity < (item.min_stock || 0)) reasons.push('Estoque Baixo')
            return { ...item, reasons }
          })
        setPantryAlerts(alerts)
      } catch (error) {
        console.error('Error loading reports data', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [family?.id, selectedMonth, selectedYear])

  const filteredTasks = useMemo(() => {
    if (selectedMember === 'all') return tasks
    return tasks.filter((t) => t.assigned_to === selectedMember)
  }, [tasks, selectedMember])

  const taskStats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.status === 'completed').length
    const overdue = filteredTasks.filter((t) => t.status === 'overdue').length
    return { total, completed, overdue }
  }, [filteredTasks])

  const chartData = useMemo(() => {
    const weeks: Record<
      number,
      { week: number; total: number; completed: number; overdue: number }
    > = {
      1: { week: 1, total: 0, completed: 0, overdue: 0 },
      2: { week: 2, total: 0, completed: 0, overdue: 0 },
      3: { week: 3, total: 0, completed: 0, overdue: 0 },
      4: { week: 4, total: 0, completed: 0, overdue: 0 },
      5: { week: 5, total: 0, completed: 0, overdue: 0 },
      6: { week: 6, total: 0, completed: 0, overdue: 0 },
    }

    filteredTasks.forEach((t) => {
      const d = parseISO(t.created.replace(' ', 'T'))
      const w = getWeekOfMonth(d)
      const weekNum = w > 6 ? 6 : w
      if (weeks[weekNum]) {
        weeks[weekNum].total += 1
        if (t.status === 'completed') weeks[weekNum].completed += 1
        if (t.status === 'overdue') weeks[weekNum].overdue += 1
      }
    })

    return Object.values(weeks)
      .filter((w) => w.total > 0 || w.week <= 4)
      .map((w) => ({
        name: `Semana ${w.week}`,
        total: w.total,
        completed: w.completed,
        overdue: w.overdue,
      }))
  }, [filteredTasks])

  const starRanking = useMemo(() => {
    const children = members.filter((m) => m.member_type === 'child')
    const ranking = children.map((child) => {
      const childStars = stars.filter((s) => s.member_id === child.id)
      const total = childStars.reduce((sum, s) => sum + (s.amount || 0), 0)
      return { ...child, totalStars: total }
    })
    return ranking.sort((a, b) => b.totalStars - a.totalStars)
  }, [stars, members])

  const handleExportCSV = () => {
    const headers = ['Título', 'Atribuído a', 'Status', 'Data de Criação']
    const rows = filteredTasks.map((t) => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${t.expand?.assigned_to?.name || 'Desconhecido'}"`,
      t.status,
      format(parseISO(t.created.replace(' ', 'T')), 'dd/MM/yyyy'),
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `tarefas_${selectedMonth + 1}_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Tarefas do Mês</h2>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os membros</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Volume de Tarefas por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : filteredTasks.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado encontrado para este período.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[4, 4, 0, 0]}
                    name="Total"
                  />
                  <Bar
                    dataKey="completed"
                    fill="var(--color-completed)"
                    radius={[4, 4, 0, 0]}
                    name="Concluídas"
                  />
                  <Bar
                    dataKey="overdue"
                    fill="var(--color-overdue)"
                    radius={[4, 4, 0, 0]}
                    name="Atrasadas"
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Estrelas Acumuladas</CardTitle>
            <CardDescription>Ranking de estrelas do mês selecionado</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : starRanking.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma estrela ganha neste período.
              </div>
            ) : (
              <div className="space-y-4">
                {starRanking.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg text-muted-foreground w-6">
                        {index + 1}º
                      </div>
                      <div className="font-medium">{member.name}</div>
                    </div>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      ⭐ {member.totalStars}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recompensas Resgatadas</CardTitle>
            <CardDescription>Recompensas aprovadas no mês</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : redemptions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum resgate neste período.
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div>
                      <div className="font-medium">{r.expand?.reward_id?.name || 'Recompensa'}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.expand?.member_id?.name || 'Desconhecido'}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        -{r.expand?.reward_id?.cost || 0} ⭐
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {r.approved_at
                          ? format(parseISO(r.approved_at.replace(' ', 'T')), 'dd/MM/yyyy')
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Alertas da Despensa
          </CardTitle>
          <CardDescription>Itens vencendo ou com estoque baixo (tempo real)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : pantryAlerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Sua despensa está em ordem!
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Alerta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pantryAlerts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {item.reasons.map((r: string, i: number) => (
                            <Badge
                              key={i}
                              variant={
                                r === 'Vencido'
                                  ? 'destructive'
                                  : r === 'Vence em breve'
                                    ? 'outline'
                                    : 'secondary'
                              }
                              className={
                                r === 'Vence em breve' ? 'border-orange-500 text-orange-600' : ''
                              }
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
