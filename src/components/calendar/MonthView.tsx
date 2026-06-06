import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarEvent } from '@/services/calendar'
import { EventBadge } from './EventBadge'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, idx) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayEvents = events.filter((e) => e.date.startsWith(dayStr))
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'min-h-[100px] border-r border-b p-1 md:p-2 cursor-pointer hover:bg-muted/30 transition-colors',
                !isSameMonth(day, currentDate) && 'bg-muted/10 opacity-50 text-muted-foreground',
                idx % 7 === 6 && 'border-r-0',
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    'text-xs md:text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full',
                    isToday(day) && 'bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventBadge
                    key={event.id}
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center font-medium">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
