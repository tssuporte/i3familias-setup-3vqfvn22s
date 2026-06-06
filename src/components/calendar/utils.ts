import { BookOpen, Users, CheckSquare, CalendarStar } from 'lucide-react'

export const typeColors: Record<string, string> = {
  school: 'bg-blue-100 text-blue-900',
  family: 'bg-green-100 text-green-900',
  task: 'bg-orange-100 text-orange-900',
  holiday: 'bg-red-100 text-red-900',
}

export const typeIcons: Record<string, any> = {
  school: BookOpen,
  family: Users,
  task: CheckSquare,
  holiday: CalendarStar,
}

export const solidColors: Record<string, string> = {
  school: 'bg-blue-500',
  family: 'bg-green-500',
  task: 'bg-orange-500',
  holiday: 'bg-red-500',
}
