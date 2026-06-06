import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent } from '@/services/calendar'
import { solidColors } from './utils'
import { cn } from '@/lib/utils'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventListProps {
  events: CalendarEvent[]
  selectedDate: Date
  onEventClick: (e: CalendarEvent) => void
  onAddClick: (d: Date) => void
}

export function EventList({ events, selectedDate, onEventClick, onAddClick }: EventListProps) {
  const dayStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEvents = events.filter((e) => e.date.startsWith(dayStr))

  return (
    <div className="rounded-lg border bg-card shadow-sm h-full flex flex-col">
      <div className="p-4 border-b bg-muted/20">
        <h3 className="font-semibold text-lg">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {dayEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-70 py-10">
            <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum evento agendado</p>
            <Button variant="outline" size="sm" onClick={() => onAddClick(selectedDate)}>
              Criar Evento
            </Button>
          </div>
        ) : (
          dayEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="p-3 rounded-md border bg-background hover:bg-muted/50 cursor-pointer transition-colors shadow-sm relative overflow-hidden"
            >
              <div
                className={cn('absolute left-0 top-0 bottom-0 w-1.5', solidColors[event.type])}
              />
              <div className="pl-3">
                <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                {event.time && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
