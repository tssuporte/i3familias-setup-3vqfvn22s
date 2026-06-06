import { useState } from 'react'
import { Camera, CheckCircle, Gift, History, Star, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function ChildInterface6to9({ member }: { member: any }) {
  const [stars, setStars] = useState(15)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Arrumar a cama', completed: false, requiresProof: true },
    { id: 2, title: 'Ler 15 minutos', completed: true, requiresProof: false },
  ])

  const handlePhotoUpload = (id: number) => {
    // Mocking photo upload process
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: true } : t)))
    setStars((prev) => prev + 5)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Meu Saldo
            </p>
            <p className="text-3xl font-bold">{stars} Estrelas</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-full font-bold h-12 px-6">
          <Gift className="w-5 h-5 mr-2 text-primary" />
          Lojinha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Minhas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl gap-4"
              >
                <span
                  className={`font-medium text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </span>
                {!task.completed ? (
                  task.requiresProof ? (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={() => handlePhotoUpload(task.id)}
                      />
                      <Button size="sm" variant="secondary" className="w-full pointer-events-none">
                        <Camera className="w-4 h-4 mr-2" /> Foto
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handlePhotoUpload(task.id)}>
                      Pronto
                    </Button>
                  )
                ) : (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 sm:w-auto text-center justify-center"
                  >
                    Concluído
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-2xl border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Gift className="w-5 h-5 mr-2 text-primary" />
                Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-slate-900">
                <span className="font-medium">1h de Videogame</span>
                <Button variant="outline" size="sm">
                  Pedir (10 ⭐)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Avisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center">
                <History className="w-4 h-4 mr-2" />
                Nenhum aviso recente. Continue assim!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
