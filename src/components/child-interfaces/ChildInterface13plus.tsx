import { useState } from 'react'
import { Calendar as CalendarIcon, Target, Crown, BarChart3, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function ChildInterface13plus({ member }: { member: any }) {
  const [isLeader, setIsLeader] = useState(false)
  const [goals] = useState([
    { id: 1, text: 'Ler 2 livros neste mês', done: false },
    { id: 2, text: 'Ajudar na cozinha 3x', done: true },
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Pessoal</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), {member?.name || 'Jovem'}. Você tem autonomia em suas tarefas.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border">
          <Crown className={`w-5 h-5 ${isLeader ? 'text-yellow-500' : 'text-slate-400'}`} />
          <div className="space-y-0.5">
            <Label htmlFor="leader-mode" className="font-semibold cursor-pointer">
              Líder da Semana
            </Label>
            <p className="text-xs text-muted-foreground">Responsável por aprovações</p>
          </div>
          <Switch id="leader-mode" checked={isLeader} onCheckedChange={setIsLeader} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" /> Metas Semanais
              </CardTitle>
              <CardDescription>Defina e acompanhe seus objetivos</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${goal.done ? 'bg-primary border-primary' : 'border-slate-300'}`}
                />
                <span className={goal.done ? 'line-through text-muted-foreground' : 'font-medium'}>
                  {goal.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" /> Calendário Pessoal
              </CardTitle>
              <CardDescription>Adicione eventos e planos</CardDescription>
            </div>
            <Button size="sm">Novo Evento</Button>
          </CardHeader>
          <CardContent>
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-muted-foreground">
              Nenhum evento pessoal agendado para esta semana.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" /> Relatório de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-primary/5 rounded-xl border">
                <h3 className="text-lg font-semibold text-primary">Taxa de Conclusão</h3>
                <p className="text-3xl font-bold mt-2">85%</p>
              </div>
              <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-xl border">
                <h3 className="text-lg font-semibold text-green-600">Economia (⭐)</h3>
                <p className="text-3xl font-bold mt-2">120</p>
              </div>
              <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border">
                <h3 className="text-lg font-semibold text-blue-600">Metas Atingidas</h3>
                <p className="text-3xl font-bold mt-2">4/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
