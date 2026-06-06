import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarEvent } from '@/services/calendar'
import { EventBadge } from './EventBadge'

interface MonthViewProps {
  currentDate: Date
  selectedDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({
  currentDate,
  selectedDate,
  events,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs md:text-sm font-medium text-muted-foreground uppercase"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayEvents = events.filter((e) => e.date.startsWith(dayStr))
          const isSelected = isSameDay(day, selectedDate)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'h-16 sm:h-24 border rounded-lg p-1 sm:p-2 cursor-pointer hover:bg-accent transition-colors flex flex-col overflow-hidden',
                !isSameMonth(day, currentDate) && 'opacity-40 bg-muted/30',
                isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
              )}
            >
              <div className="flex justify-start mb-1">
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-medium h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isToday(day)
                        ? 'bg-secondary text-secondary-foreground'
                        : '',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1 overflow-y-auto flex-1 scrollbar-none hidden sm:block">
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
              <div className="sm:hidden flex flex-wrap gap-0.5 mt-auto pb-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      event.type === 'school'
                        ? 'bg-blue-500'
                        : event.type === 'family'
                          ? 'bg-green-500'
                          : event.type === 'task'
                            ? 'bg-orange-500'
                            : 'bg-red-500',
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
