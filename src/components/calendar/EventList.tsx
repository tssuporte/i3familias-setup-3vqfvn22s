import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent, deleteCalendarEvent } from '@/services/calendar'
import { typeColors, typeIcons } from './utils'
import { cn } from '@/lib/utils'
import { Clock, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface EventListProps {
  events: CalendarEvent[]
  selectedDate: Date
  onEventClick: (e: CalendarEvent) => void
  onAddClick: (d: Date) => void
}

export function EventList({ events, selectedDate, onEventClick, onAddClick }: EventListProps) {
  const { toast } = useToast()
  const dayStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEvents = events.filter((e) => e.date.startsWith(dayStr))

  const handleDelete = async (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation()
    if (!confirm('Deseja realmente excluir este evento?')) return
    try {
      await deleteCalendarEvent(event.id)
      toast({ title: 'Sucesso', description: 'Evento excluído.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao excluir evento.', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-bold text-lg">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {dayEvents.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 flex flex-col items-center justify-center text-center space-y-3 opacity-70">
            <CalendarIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum evento agendado</p>
            <Button variant="outline" size="sm" onClick={() => onAddClick(selectedDate)}>
              Criar Evento
            </Button>
          </div>
        ) : (
          dayEvents.map((event, index) => {
            const Icon = typeIcons[event.type] || CalendarIcon
            return (
              <div key={event.id}>
                <div
                  onClick={() => onEventClick(event)}
                  className="p-3 rounded-lg border bg-card hover:bg-secondary cursor-pointer transition-colors shadow-sm flex items-center gap-3"
                >
                  <div
                    className={cn('p-2 rounded-md shrink-0', typeColors[event.type] || 'bg-muted')}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                    {event.time && (
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.time}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, event)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < dayEvents.length - 1 && (
                  <div className="h-px bg-border my-3 mx-2 opacity-50" />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
