import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Apple, Bed, Brush, Star } from 'lucide-react'

const TASKS = [
  { id: 1, label: 'Comer', icon: Apple, color: 'text-red-500' },
  { id: 2, label: 'Dormir', icon: Bed, color: 'text-blue-500' },
  { id: 3, label: 'Escovar', icon: Brush, color: 'text-emerald-500' },
]

export function ChildInterface4to5({ member }: { member: any }) {
  const [completed, setCompleted] = useState<number[]>([])
  const [pressing, setPressing] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startPress = (id: number) => {
    if (completed.includes(id)) return
    setPressing(id)
    timerRef.current = setTimeout(() => {
      setCompleted((prev) => [...prev, id])
      setPressing(null)
    }, 2000) // 2-second long press
  }

  const cancelPress = () => {
    setPressing(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex justify-center items-center space-x-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm">
        <span className="text-2xl font-bold">Figurinhas:</span>
        <div className="flex space-x-2">
          {[...Array(completed.length)].map((_, i) => (
            <Star key={i} className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-fade-in" />
          ))}
          {completed.length === 0 && (
            <span className="text-xl text-muted-foreground">Nenhuma ainda!</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {TASKS.map((task) => {
          const Icon = task.icon
          const isCompleted = completed.includes(task.id)
          const isPressing = pressing === task.id

          return (
            <div
              key={task.id}
              onMouseDown={() => startPress(task.id)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={() => startPress(task.id)}
              onTouchEnd={cancelPress}
              className={cn(
                'relative flex flex-col items-center justify-center p-8 rounded-3xl border-4 transition-all select-none cursor-pointer overflow-hidden bg-white dark:bg-slate-900',
                isCompleted
                  ? 'border-slate-200 opacity-50'
                  : 'border-slate-300 hover:border-slate-400',
              )}
            >
              <Icon className={cn('w-20 h-20 mb-4 z-10', task.color)} />
              <span className="text-3xl font-black z-10">{task.label}</span>

              {isPressing && !isCompleted && (
                <div
                  className="absolute inset-0 bg-primary/20 animate-pulse origin-bottom"
                  style={{ transition: 'all 2s linear' }}
                />
              )}
              {isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20">
                  <Star className="w-24 h-24 text-yellow-400 fill-yellow-400 animate-bounce" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
