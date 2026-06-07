export type NotificationType = 'task' | 'star' | 'study' | 'pantry' | 'calendar' | 'system'

export interface Notification {
  id: string
  family_id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created: string
  updated: string
}
