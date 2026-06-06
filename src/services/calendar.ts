import pb from '@/lib/pocketbase/client'

export interface CalendarEvent {
  id: string
  family_id: string
  title: string
  type: 'school' | 'family' | 'task' | 'holiday'
  date: string
  time?: string
  attendees?: string[]
  description?: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
  created: string
  updated: string
  expand?: {
    attendees?: { id: string; name: string; photo_url: string }[]
  }
}

export const getCalendarEvents = (familyId: string, startDate: string, endDate: string) => {
  return pb.collection('calendar_events').getFullList<CalendarEvent>({
    filter: `family_id = "${familyId}" && date >= "${startDate}" && date <= "${endDate}"`,
    sort: 'date,time',
    expand: 'attendees',
  })
}

export const createCalendarEvent = (data: Partial<CalendarEvent>) => {
  return pb.collection('calendar_events').create<CalendarEvent>(data)
}

export const updateCalendarEvent = (id: string, data: Partial<CalendarEvent>) => {
  return pb.collection('calendar_events').update<CalendarEvent>(id, data)
}

export const deleteCalendarEvent = (id: string) => {
  return pb.collection('calendar_events').delete(id)
}
