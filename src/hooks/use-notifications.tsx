import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Notification } from '@/types/notification'
import * as notificationService from '@/services/notifications'

interface NotificationContextType {
  notifications: Notification[]
  loading: boolean
  error: Error | null
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast.error('Não foi possível carregar notificações.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useRealtime<Notification>('notifications', (e) => {
    if (e.action === 'create') {
      setNotifications((prev) => [e.record, ...prev])

      const { title, message, type } = e.record
      const text = `${title}: ${message}`

      if (type === 'task' || type === 'star') {
        toast.success(text, { duration: 4000 })
      } else if (type === 'pantry') {
        toast.warning(text, { duration: 4000 })
      } else if (type === 'system') {
        toast.error(text, { duration: 4000 })
      } else {
        toast.info(text, { duration: 4000 })
      }
    } else if (e.action === 'update') {
      setNotifications((prev) => prev.map((n) => (n.id === e.record.id ? e.record : n)))
    } else if (e.action === 'delete') {
      setNotifications((prev) => prev.filter((n) => n.id !== e.record.id))
    }
  })

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await notificationService.markAsRead(id)
    } catch (err) {
      fetchNotifications()
    }
  }

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await notificationService.deleteNotification(id)
    } catch (err) {
      fetchNotifications()
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, error, unreadCount, markAsRead, deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
