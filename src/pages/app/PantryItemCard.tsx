import { format, differenceInDays, startOfDay, parseISO, isPast } from 'date-fns'
import { Edit, Trash2, CheckCircle2, Clock, AlertCircle, MapPin } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PantryItem } from '@/services/pantry'

interface PantryItemCardProps {
  item: PantryItem
  onEdit: (item: PantryItem) => void
  onDelete: (id: string) => void
  onMarkUsed: (id: string, qty: number) => void
}

export function PantryItemCard({ item, onEdit, onDelete, onMarkUsed }: PantryItemCardProps) {
  let status: 'ok' | 'expiring' | 'expired' = 'ok'
  let borderColor = 'border-l-green-500 dark:border-l-green-400'

  if (item.expiry_date) {
    const date = startOfDay(parseISO(item.expiry_date))
    const today = startOfDay(new Date())
    if (isPast(date) && date.getTime() < today.getTime()) {
      status = 'expired'
      borderColor = 'border-l-red-500 dark:border-l-red-400'
    } else {
      const diff = differenceInDays(date, today)
      if (diff <= 7) {
        status = 'expiring'
        borderColor = 'border-l-yellow-500 dark:border-l-yellow-400'
      }
    }
  } else {
    borderColor = 'border-l-border'
  }

  const badgeProps = {
    ok: {
      label: 'No prazo',
      variant: 'outline' as const,
      className:
        'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50',
      icon: CheckCircle2,
    },
    expiring: {
      label: 'Vence em breve',
      variant: 'secondary' as const,
      className:
        'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50',
      icon: Clock,
    },
    expired: {
      label: 'Vencido',
      variant: 'destructive' as const,
      className:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 hover:bg-red-50',
      icon: AlertCircle,
    },
  }

  const StatusIcon = badgeProps[status].icon

  return (
    <Card
      className={cn(
        'flex flex-col relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-md border-l-4',
        borderColor,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 items-start">
          <CardTitle className="text-lg line-clamp-1 w-full" title={item.name}>
            {item.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2 items-center w-full">
            {item.expiry_date && (
              <Badge
                variant={badgeProps[status].variant}
                className={cn('shrink-0 flex items-center gap-1', badgeProps[status].className)}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="text-xs">{badgeProps[status].label}</span>
              </Badge>
            )}
            {item.location && (
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]" title={item.location}>
                  {item.location}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 text-sm text-muted-foreground space-y-3">
        <div className="flex justify-between items-center bg-secondary/30 px-3 py-2 rounded-lg">
          <span className="font-medium text-foreground">Quantidade</span>
          <div className="flex items-baseline gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md shadow-sm">
            <span className="text-xl font-bold leading-none">{item.quantity}</span>
            <span className="text-sm font-medium">{item.unit}</span>
          </div>
        </div>

        {item.category && (
          <div className="flex justify-between items-center px-1 pt-1">
            <span className="font-medium text-muted-foreground">Categoria:</span>
            <span
              className="text-right truncate max-w-[140px] text-foreground font-medium"
              title={item.category}
            >
              {item.category}
            </span>
          </div>
        )}
        {item.expiry_date && (
          <div className="flex justify-between items-center px-1">
            <span className="font-medium text-muted-foreground">Validade:</span>
            <span className="text-foreground font-medium">
              {format(parseISO(item.expiry_date), 'dd/MM/yyyy')}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 transition-colors hover:bg-secondary/50"
          onClick={() => onMarkUsed(item.id, item.quantity)}
          disabled={item.quantity <= 0}
        >
          Marcar como usado
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
