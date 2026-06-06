import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { createCalendarEvent, updateCalendarEvent, CalendarEvent } from '@/services/calendar'
import { getFamilyMembers, FamilyMember } from '@/services/family-members'

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
        toast({ title: 'Sucesso', description: 'Evento atualizado.' })
      } else {
        await createCalendarEvent(data)
        toast({ title: 'Sucesso', description: 'Evento criado.' })
      }
      setIsOpen(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar evento.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendee = (id: string) => {
    setAttendees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md !rounded-t-2xl sm:!rounded-lg shadow-lg !bottom-0 !top-auto !translate-y-0 sm:!top-[50%] sm:!translate-y-[-50%] p-6 m-0 gap-6 w-full fixed max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="font-bold">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião Escolar"
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex flex-col gap-2 flex-1">
              <Label className="font-bold">Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">Escola</SelectItem>
                  <SelectItem value="family">Família</SelectItem>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="holiday">Feriado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label className="font-bold">Recorrência</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="w-full">
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
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="date" className="font-bold">
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="time" className="font-bold">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold">Participantes</Label>
            <div className="border rounded-lg p-3 grid grid-cols-2 gap-3 max-h-32 overflow-y-auto bg-muted/10">
              {members.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${m.id}`}
                    checked={attendees.includes(m.id)}
                    onCheckedChange={() => toggleAttendee(m.id)}
                  />
                  <label
                    htmlFor={`member-${m.id}`}
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    {m.name}
                  </label>
                </div>
              ))}
              {members.length === 0 && (
                <span className="text-sm text-muted-foreground col-span-2 text-center py-2">
                  Nenhum membro encontrado.
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="desc" className="font-bold">
              Descrição
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="resize-none w-full"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="mt-2 w-full sm:justify-start">
          <Button onClick={handleSave} disabled={!isValid || loading} className="w-full">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
