import { CalendarEvent } from '@/services/calendar'
import { cn } from '@/lib/utils'
import { typeColors } from './utils'

interface EventBadgeProps {
  event: CalendarEvent
  onClick?: (e: React.MouseEvent) => void
}

export function EventBadge({ event, onClick }: EventBadgeProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'px-1.5 py-0.5 text-[10px] md:text-xs rounded border truncate cursor-pointer hover:opacity-80 transition-opacity',
        typeColors[event.type] || 'bg-muted text-muted-foreground',
      )}
      title={event.title}
    >
      {event.time && <span className="font-semibold mr-1">{event.time}</span>}
      {event.title}
    </div>
  )
}
