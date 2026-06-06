import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, CheckCircle, Clock, Camera } from 'lucide-react'

export function ChildTaskCard({ task, onComplete, isLoading }: any) {
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState<string>('')

  const handleComplete = async () => {
    await onComplete(task.id, photo)
    setOpen(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-lg">{task.name}</span>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {task.due_time || 'Sem horário'}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" /> {task.stars_value}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            {task.status === 'completed' ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" /> Concluída
              </Badge>
            ) : task.status === 'overdue' ? (
              <Badge variant="destructive">Atrasada</Badge>
            ) : (
              <Badge variant="outline">Pendente</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-xl font-bold">{task.name}</h3>
              <p className="text-muted-foreground">Recompensa: {task.stars_value} estrelas</p>
            </div>
            {task.requires_photo && task.status !== 'completed' && (
              <div className="space-y-2 bg-muted p-4 rounded-md">
                <Label className="flex items-center gap-2 mb-2 font-medium">
                  <Camera className="w-4 h-4 text-primary" />
                  Esta tarefa requer uma foto como comprovante
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="bg-background"
                />
                {photo && (
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-md mt-2 shadow-sm"
                  />
                )}
              </div>
            )}
            {task.status === 'completed' && task.photo_url && (
              <div className="space-y-2">
                <Label>Comprovante enviado:</Label>
                <img
                  src={task.photo_url}
                  alt="Comprovante"
                  className="w-full max-h-48 object-cover rounded-md mt-2 shadow-sm"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            {task.status !== 'completed' && (
              <Button
                onClick={handleComplete}
                disabled={isLoading || (task.requires_photo && !photo)}
              >
                {isLoading ? 'Concluindo...' : 'Marcar como Concluída'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
