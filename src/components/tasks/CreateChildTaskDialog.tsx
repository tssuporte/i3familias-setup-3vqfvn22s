import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'

export function CreateChildTaskDialog({ childrenMembers, onCreate, isLoading }: any) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    assigned_to: '',
    recurrence: 'once',
    due_time: '',
    stars_value: 10,
    requires_photo: false,
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.assigned_to) return
    await onCreate({ ...formData, status: 'pending' })
    setOpen(false)
    setFormData({
      name: '',
      assigned_to: '',
      recurrence: 'once',
      due_time: '',
      stars_value: 10,
      requires_photo: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Tarefa para Criança</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Tarefa</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Arrumar a cama"
            />
          </div>
          <div className="space-y-2">
            <Label>Atribuir para</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a criança" />
              </SelectTrigger>
              <SelectContent>
                {childrenMembers.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário limite</Label>
              <Input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estrelas</Label>
              <Input
                type="number"
                min="0"
                value={formData.stars_value}
                onChange={(e) => setFormData({ ...formData, stars_value: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-md">
            <Label className="cursor-pointer" htmlFor="req-photo">
              Exigir foto como comprovante?
            </Label>
            <Switch
              id="req-photo"
              checked={formData.requires_photo}
              onCheckedChange={(c) => setFormData({ ...formData, requires_photo: c })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.assigned_to}
          >
            {isLoading ? 'Criando...' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
