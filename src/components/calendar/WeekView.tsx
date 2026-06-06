import { useMemo } from 'react'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarEvent } from '@/services/calendar'
import { EventBadge } from './EventBadge'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function WeekView({ currentDate, events, onDayClick, onEventClick }: WeekViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="grid grid-cols-7 border-b sticky top-0 bg-card z-10">
        {days.map((day, i) => (
          <div key={i} className={cn('p-2 text-center border-r', i === 6 && 'border-r-0')}>
            <div className="text-xs text-muted-foreground uppercase">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div
              className={cn(
                'text-lg font-semibold mx-auto w-8 h-8 flex items-center justify-center rounded-full mt-1',
                isToday(day) && 'bg-primary text-primary-foreground',
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 min-h-[400px]">
        {days.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayEvents = events.filter((e) => e.date.startsWith(dayStr))
          return (
            <div
              key={i}
              className={cn(
                'border-r p-1.5 sm:p-2 space-y-1.5 cursor-pointer hover:bg-accent transition-colors',
                i === 6 && 'border-r-0',
              )}
              onClick={() => onDayClick(day)}
            >
              {dayEvents.map((event) => (
                <EventBadge
                  key={event.id}
                  event={event}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
