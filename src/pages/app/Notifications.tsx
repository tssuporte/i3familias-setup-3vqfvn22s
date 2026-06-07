import { useState, useRef } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Notification, NotificationType } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckSquare,
  Star,
  BookOpen,
  ShoppingBasket,
  Calendar,
  Bell,
  Trash2,
  BellRing,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const ICONS: Record<NotificationType, React.ElementType> = {
  task: CheckSquare,
  star: Star,
  study: BookOpen,
  pantry: ShoppingBasket,
  calendar: Calendar,
  system: Bell,
}

const COLORS: Record<NotificationType, string> = {
  task: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  star: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  study: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  pantry: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  calendar: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  system: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
}

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'Não lidas' },
  { id: 'task', label: 'Tarefas' },
  { id: 'star', label: 'Estrelas' },
  { id: 'study', label: 'Estudos' },
  { id: 'pantry', label: 'Despensa' },
  { id: 'calendar', label: 'Calendário' },
]

export default function NotificationsPage() {
  const { notifications, loading, error, markAsRead, deleteNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('all')

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'all') return true
    return n.type === activeTab
  })

  const hasUnread = (tabId: string) => {
    if (tabId === 'all') return false
    if (tabId === 'unread') return notifications.some((n) => !n.read)
    return notifications.some((n) => n.type === tabId && !n.read)
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Não foi possível carregar notificações.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">Gerencie seus alertas e atividades recentes.</p>
      </div>

      <div className="scrollbar-none flex overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {tab.label}
              {hasUnread(tab.id) && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4" role="log" aria-live="polite">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 rounded-lg border p-4 bg-card">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center text-center space-y-4 text-muted-foreground animate-fade-in">
            <BellRing className="h-12 w-12 text-muted-foreground/50" />
            <p>Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification
  onRead: () => void
  onDelete: () => void
}) {
  const [offsetX, setOffsetX] = useState(0)
  const startXRef = useRef(0)
  const Icon = ICONS[notification.type] || Bell
  const colorClass = COLORS[notification.type]

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startXRef.current
    if (diff < -150) setOffsetX(-150)
    else if (diff > 150) setOffsetX(150)
    else setOffsetX(diff)
  }

  const handleTouchEnd = () => {
    if (offsetX > 100 && !notification.read) {
      onRead()
    } else if (offsetX < -100) {
      onDelete()
    }
    setOffsetX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm transition-colors group">
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex w-1/2 items-center pl-6 bg-blue-500 text-white font-medium z-0',
          offsetX < 0 && 'opacity-0',
        )}
      >
        <CheckCircle2 className="mr-2 h-5 w-5" /> Marcar lido
      </div>
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-6 bg-destructive text-white font-medium z-0',
          offsetX > 0 && 'opacity-0',
        )}
      >
        Excluir <Trash2 className="ml-2 h-5 w-5" />
      </div>

      <div
        className="relative flex items-start gap-4 p-4 bg-card hover:bg-muted/50 transition-transform cursor-pointer z-10"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !notification.read && onRead()}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            colorClass,
          )}
        >
          <Icon className="h-5 w-5" aria-label={notification.type} />
        </div>

        <div className="flex-1 space-y-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'font-semibold leading-none',
                !notification.read ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {notification.title}
            </p>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(notification.created), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
          <p
            className={cn(
              'text-sm line-clamp-2',
              !notification.read ? 'text-foreground/90' : 'text-muted-foreground',
            )}
          >
            {notification.message}
          </p>
        </div>

        {!notification.read && (
          <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="hidden absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:group-hover:flex transition-colors"
          aria-label="Deletar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
