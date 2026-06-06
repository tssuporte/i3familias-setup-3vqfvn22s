import { format, differenceInDays, startOfDay, parseISO, isPast } from 'date-fns'
import { Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PantryItem } from '@/services/pantry'

interface PantryItemCardProps {
  item: PantryItem
  onEdit: (item: PantryItem) => void
  onDelete: (id: string) => void
  onMarkUsed: (id: string, qty: number) => void
}

export function PantryItemCard({ item, onEdit, onDelete, onMarkUsed }: PantryItemCardProps) {
  let status: 'ok' | 'expiring' | 'expired' = 'ok'

  if (item.expiry_date) {
    const date = startOfDay(parseISO(item.expiry_date))
    const today = startOfDay(new Date())
    if (isPast(date) && date.getTime() < today.getTime()) {
      status = 'expired'
    } else {
      const diff = differenceInDays(date, today)
      if (diff <= 7) status = 'expiring'
    }
  }

  const badgeProps = {
    ok: {
      label: 'No prazo',
      variant: 'outline' as const,
      className:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle2,
    },
    expiring: {
      label: 'Vence em breve',
      variant: 'secondary' as const,
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: Clock,
    },
    expired: {
      label: 'Vencido',
      variant: 'destructive' as const,
      className: '',
      icon: AlertCircle,
    },
  }

  const StatusIcon = badgeProps[status].icon

  return (
    <Card className="flex flex-col animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-lg line-clamp-1" title={item.name}>
            {item.name}
          </CardTitle>
          {item.expiry_date && (
            <Badge
              variant={badgeProps[status].variant}
              className={`w-fit shrink-0 flex items-center gap-1 ${badgeProps[status].className}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span className="text-xs">{badgeProps[status].label}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 text-sm text-muted-foreground space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Quantidade:</span>
          <span className="text-base font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-md">
            {item.quantity} {item.unit}
          </span>
        </div>
        {item.location && (
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Local:</span>
            <span className="text-right truncate max-w-[120px]" title={item.location}>
              {item.location}
            </span>
          </div>
        )}
        {item.category && (
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Categoria:</span>
            <span className="text-right truncate max-w-[120px]" title={item.category}>
              {item.category}
            </span>
          </div>
        )}
        {item.expiry_date && (
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Validade:</span>
            <span>{format(parseISO(item.expiry_date), 'dd/MM/yyyy')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onMarkUsed(item.id, item.quantity)}
          disabled={item.quantity <= 0}
        >
          Marcar como usado
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
