import { format } from 'date-fns'
import { CalendarEvent } from '@/services/calendar'
import { typeColors } from './utils'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (e: CalendarEvent) => void
  onAddClick: (d: Date) => void
}

export function DayView({ currentDate, events, onEventClick, onAddClick }: DayViewProps) {
  const dayStr = format(currentDate, 'yyyy-MM-dd')
  const dayEvents = events.filter((e) => e.date.startsWith(dayStr))

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-auto">
      {dayEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <Clock className="w-16 h-16 opacity-20" />
          <p>Nenhum evento agendado para este dia.</p>
          <Button variant="outline" onClick={() => onAddClick(currentDate)}>
            Criar Evento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className={cn(
                'p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all flex flex-col gap-2',
                typeColors[event.type],
              )}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{event.title}</h3>
                {event.time && (
                  <div className="flex items-center text-sm font-medium opacity-80">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </div>
                )}
              </div>
              {event.description && <p className="text-sm opacity-90">{event.description}</p>}
              {event.expand?.attendees && event.expand.attendees.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium opacity-70">Participantes:</span>
                  <div className="flex -space-x-2">
                    {event.expand.attendees.map((a) => (
                      <div
                        key={a.id}
                        className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden"
                        title={a.name}
                      >
                        {a.photo_url ? (
                          <img src={a.photo_url} alt={a.name} />
                        ) : (
                          a.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
