import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'
import { getCalendarEvents, CalendarEvent } from '@/services/calendar'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'

export function useCalendar(familyId: string | undefined) {
  const isMobile = useIsMobile()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Mobile defaults to week view
  useEffect(() => {
    if (isMobile) {
      setView('week')
    }
  }, [isMobile])

  const dateRange = useMemo(() => {
    let start, end
    if (view === 'month') {
      start = startOfWeek(startOfMonth(currentDate))
      end = endOfWeek(endOfMonth(currentDate))
    } else if (view === 'week') {
      start = startOfWeek(currentDate)
      end = endOfWeek(currentDate)
    } else {
      start = currentDate
      end = currentDate
    }
    return {
      start: format(start, 'yyyy-MM-dd 00:00:00'),
      end: format(end, 'yyyy-MM-dd 23:59:59'),
    }
  }, [currentDate, view])

  const loadEvents = useCallback(async () => {
    if (!familyId) return
    try {
      setLoading(true)
      const data = await getCalendarEvents(familyId, dateRange.start, dateRange.end)
      setEvents(data)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar eventos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [familyId, dateRange, toast])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useRealtime('calendar_events', () => {
    loadEvents()
  })

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    events,
    loading,
    refresh: loadEvents,
  }
}
