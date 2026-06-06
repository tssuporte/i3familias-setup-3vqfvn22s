import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent,
} from '@/services/calendar'
import { getFamilyMembers, FamilyMember } from '@/services/family-members'
import { Trash2 } from 'lucide-react'

interface EventDialogProps {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  event: CalendarEvent | null
  defaultDate: Date
  familyId: string
}

export function EventDialog({ isOpen, setIsOpen, event, defaultDate, familyId }: EventDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<FamilyMember[]>([])

  const [title, setTitle] = useState('')
  const [type, setType] = useState<any>('family')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [recurrence, setRecurrence] = useState<any>('none')
  const [attendees, setAttendees] = useState<string[]>([])

  useEffect(() => {
    if (familyId && isOpen) {
      getFamilyMembers(familyId).then(setMembers).catch(console.error)
    }
  }, [familyId, isOpen])

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setType(event.type)
      setDate(event.date.substring(0, 10))
      setTime(event.time || '')
      setDescription(event.description || '')
      setRecurrence(event.recurrence || 'none')
      setAttendees(event.attendees || [])
    } else {
      setTitle('')
      setType('family')
      setDate(format(defaultDate, 'yyyy-MM-dd'))
      setTime('')
      setDescription('')
      setRecurrence('none')
      setAttendees([])
    }
  }, [event, defaultDate, isOpen])

  const isValid = title.trim().length > 0 && date.length > 0

  const handleSave = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      const data = {
        family_id: familyId,
        title,
        type,
        date: `${date} 12:00:00.000Z`,
        time,
        description,
        recurrence,
        attendees,
      }
      if (event) {
        await updateCalendarEvent(event.id, data)
        toast({ title: 'Sucesso', description: 'Evento atualizado com sucesso.' })
      } else {
        await createCalendarEvent(data)
        toast({ title: 'Sucesso', description: 'Evento criado com sucesso.' })
      }
      setIsOpen(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar evento.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    if (!confirm('Deseja realmente excluir este evento?')) return
    setLoading(true)
    try {
      await deleteCalendarEvent(event.id)
      toast({ title: 'Sucesso', description: 'Evento excluído.' })
      setIsOpen(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao excluir evento.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendee = (id: string) => {
    setAttendees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          <DialogDescription>
            {event
              ? 'Altere os detalhes do evento abaixo.'
              : 'Preencha os detalhes para criar um novo evento.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião Escolar"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Família</SelectItem>
                  <SelectItem value="school">Escola</SelectItem>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="holiday">Feriado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Recorrência</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Participantes</Label>
            <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${m.id}`}
                    checked={attendees.includes(m.id)}
                    onCheckedChange={() => toggleAttendee(m.id)}
                  />
                  <label
                    htmlFor={`member-${m.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {m.name}
                  </label>
                </div>
              ))}
              {members.length === 0 && (
                <span className="text-sm text-muted-foreground">Nenhum membro encontrado.</span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
          {event ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!isValid || loading}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
