import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Apple, BedDouble, Gamepad2, Star } from 'lucide-react'

const MOCK_TASKS = [
  { id: 1, icon: Apple, color: 'bg-red-400', shadow: 'shadow-red-600' },
  { id: 2, icon: BedDouble, color: 'bg-blue-400', shadow: 'shadow-blue-600' },
  { id: 3, icon: Gamepad2, color: 'bg-green-400', shadow: 'shadow-green-600' },
]

export function ChildInterface0to3({ member }: { member: any }) {
  const [completed, setCompleted] = useState<number[]>([])
  const [celebrating, setCelebrating] = useState<number | null>(null)

  const handleTap = (id: number) => {
    if (completed.includes(id)) return
    setCelebrating(id)

    // Simulate victory sound via visual feedback (no actual audio to prevent autoplay issues)
    setTimeout(() => {
      setCompleted((prev) => [...prev, id])
      setCelebrating(null)
    }, 1500)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MOCK_TASKS.map((task) => {
          const Icon = task.icon
          const isCompleted = completed.includes(task.id)
          const isCelebrating = celebrating === task.id

          return (
            <button
              key={task.id}
              onClick={() => handleTap(task.id)}
              disabled={isCompleted || isCelebrating}
              className={cn(
                'relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-300 transform',
                task.color,
                !isCompleted &&
                  !isCelebrating &&
                  `shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.2)] ${task.shadow}`,
                isCompleted && 'opacity-50 scale-95 shadow-none',
                isCelebrating && 'animate-bounce scale-110 shadow-none ring-8 ring-yellow-400',
              )}
            >
              {isCelebrating ? (
                <Star className="w-24 h-24 text-yellow-300 fill-yellow-300 animate-spin" />
              ) : (
                <Icon className="w-24 h-24 text-white" strokeWidth={3} />
              )}
            </button>
          )
        })}
      </div>
      {completed.length === MOCK_TASKS.length && (
        <div className="animate-fade-in-up text-center">
          <Star className="w-32 h-32 text-yellow-400 fill-yellow-400 mx-auto animate-pulse" />
        </div>
      )}
    </div>
  )
}
