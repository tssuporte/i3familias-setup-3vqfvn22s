import { useState, useEffect } from 'react'
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useCalendar } from '@/hooks/use-calendar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { EventDialog } from '@/components/calendar/EventDialog'
import { EventList } from '@/components/calendar/EventList'

export default function Calendar() {
  const [familyId, setFamilyId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  useEffect(() => {
    pb.collection('families')
      .getFirstListItem(`user_id="${pb.authStore.record?.id}"`)
      .then((f) => setFamilyId(f.id))
      .catch(console.error)
  }, [])

  const { currentDate, setCurrentDate, view, setView, events, loading } = useCalendar(familyId)

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const handleAdd = (date = selectedDate) => {
    setEditingEvent(null)
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="flex flex-col h-full space-y-4 pb-16 md:pb-0 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendário Familiar</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="day">Dia</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="icon" onClick={() => handleAdd()} className="hidden md:flex">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-card rounded-lg border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="hover:scale-110 transition-transform cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold capitalize">
          {format(currentDate, view === 'day' ? "dd 'de' MMMM, yyyy" : 'MMMM yyyy', {
            locale: ptBR,
          })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="hover:scale-110 transition-transform cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        <div className="w-full md:w-3/4 rounded-lg bg-card overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 p-6 flex flex-col space-y-4 border rounded-lg">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ) : view === 'month' ? (
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEdit}
            />
          ) : view === 'week' ? (
            <WeekView
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEdit}
            />
          ) : (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEdit}
              onAddClick={handleAdd}
            />
          )}
        </div>

        <div className="w-full md:w-1/4">
          {loading ? (
            <div className="rounded-lg border bg-card shadow-sm h-full flex flex-col p-4 space-y-4">
              <div className="h-10 bg-muted/40 animate-pulse rounded-md w-2/3" />
              <div className="space-y-3 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-md" />
                ))}
              </div>
            </div>
          ) : (
            <EventList
              events={events}
              selectedDate={selectedDate}
              onEventClick={handleEdit}
              onAddClick={handleAdd}
            />
          )}
        </div>
      </div>

      {familyId && (
        <EventDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          event={editingEvent}
          defaultDate={selectedDate}
          familyId={familyId}
        />
      )}

      <Button
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => handleAdd()}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
