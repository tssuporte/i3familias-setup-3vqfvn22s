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
        className="cursor-pointer bg-card hover:bg-secondary transition-transform duration-200 active:scale-[0.98] border-0 border-l-4 border-l-primary rounded-lg overflow-hidden shadow-sm"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-lg">{task.name}</span>
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
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3 py-1"
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Concluída
              </Badge>
            ) : task.status === 'overdue' ? (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800 hover:bg-red-100 border-none px-3 py-1"
              >
                Atrasada
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none px-3 py-1"
              >
                Pendente
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-8 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Detalhes da Tarefa</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <h3 className="text-xl font-bold">{task.name}</h3>
              <p className="text-muted-foreground">Recompensa: {task.stars_value} estrelas</p>
            </div>
            {task.requires_photo && task.status !== 'completed' && (
              <div className="flex flex-col gap-4">
                <Label className="font-medium">Comprovante (Foto)</Label>
                <div className="relative border-2 border-dashed border-primary/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {photo ? (
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-md shadow-sm"
                    />
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-primary/60 mb-3" />
                      <span className="text-sm font-medium text-foreground">
                        Clique ou arraste uma foto
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Para confirmar a conclusão
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            {task.status === 'completed' && task.photo_url && (
              <div className="flex flex-col gap-2">
                <Label className="font-medium">Comprovante enviado</Label>
                <img
                  src={task.photo_url}
                  alt="Comprovante"
                  className="w-full max-h-48 object-cover rounded-md shadow-sm border"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-2 sm:justify-center">
            {task.status !== 'completed' && (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
                onClick={handleComplete}
                disabled={isLoading || (task.requires_photo && !photo)}
              >
                {isLoading ? 'Concluindo...' : 'Concluir Tarefa'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
