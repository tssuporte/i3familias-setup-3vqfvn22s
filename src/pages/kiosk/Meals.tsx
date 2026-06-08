import { KioskPageLayout } from '@/components/kiosk/KioskPageLayout'
import { useState, useEffect, useCallback } from 'react'
import { getMeals, type Meal } from '@/services/meals'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { Coffee, Sun, Moon, Clock, ChefHat, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const mealTypes = [
  { id: 'breakfast' as const, label: 'Café da Manhã', icon: Coffee },
  { id: 'lunch' as const, label: 'Almoço', icon: Sun },
  { id: 'dinner' as const, label: 'Jantar', icon: Moon },
]

const difficultyMap = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

export default function KioskMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  const loadData = useCallback(async () => {
    const userId = pb.authStore.record?.id
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const family = await pb.collection('families').getFirstListItem(`user_id='${userId}'`)
      if (family) {
        const todayStr = format(new Date(), 'yyyy-MM-dd')
        const data = await getMeals(family.id, todayStr, todayStr)
        setMeals(data)
      }
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timeInterval)
  }, [loadData])

  useRealtime('meals', () => {
    loadData()
  })

  const hour = currentTime.getHours()
  let activeMealType: 'breakfast' | 'lunch' | 'dinner' = 'breakfast'
  if (hour >= 12 && hour < 18) {
    activeMealType = 'lunch'
  } else if (hour >= 18) {
    activeMealType = 'dinner'
  }

  return (
    <KioskPageLayout title="Cardápio do Dia">
      <div className="flex-1 w-full max-w-7xl mx-auto p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mealTypes.map(({ id, label, icon: Icon }) => {
            const meal = meals.find((m) => m.meal_type === id)
            const isActive = activeMealType === id

            return (
              <Card
                key={id}
                className={cn(
                  'flex flex-col relative overflow-hidden transition-all duration-500 h-full min-h-[500px]',
                  isActive
                    ? 'ring-4 ring-primary shadow-2xl scale-105 bg-card'
                    : 'opacity-70 scale-100 bg-muted/30',
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary animate-pulse" />
                )}

                <CardHeader className="text-center pb-4 pt-8">
                  <div
                    className={cn(
                      'mx-auto p-5 rounded-full mb-6 transition-colors duration-300',
                      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="w-16 h-16" />
                  </div>
                  <CardTitle className="text-4xl font-bold tracking-tight">{label}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col items-center text-center p-8 pt-0">
                  {loading ? (
                    <div className="space-y-6 w-full flex flex-col items-center pt-8">
                      <Skeleton className="h-10 w-3/4 rounded-full" />
                      <Skeleton className="h-6 w-full rounded-full" />
                      <Skeleton className="h-6 w-5/6 rounded-full" />
                    </div>
                  ) : meal ? (
                    <div className="flex flex-col flex-1 w-full animate-fade-in">
                      {meal.is_cooked && (
                        <div className="mb-6 flex justify-center">
                          <Badge
                            variant="default"
                            className="text-2xl py-2 px-6 bg-green-500 hover:bg-green-600 shadow-md text-white"
                          >
                            <CheckCircle2 className="w-8 h-8 mr-3" />
                            Pronto!
                          </Badge>
                        </div>
                      )}

                      <h3 className="text-3xl font-bold text-foreground mb-8 leading-tight">
                        {meal.dish}
                      </h3>

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="mb-8 w-full bg-background/50 rounded-xl p-6 shadow-inner">
                          <p className="font-semibold text-xl text-muted-foreground mb-3 uppercase tracking-wider">
                            Ingredientes
                          </p>
                          <p className="text-2xl text-foreground line-clamp-4 leading-relaxed">
                            {Array.isArray(meal.ingredients)
                              ? meal.ingredients.join(', ')
                              : meal.ingredients}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto pt-6 flex flex-wrap items-center justify-center gap-8 border-t border-border/50">
                        {meal.prep_time > 0 && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="w-8 h-8" />
                            <span className="text-2xl font-medium">{meal.prep_time} min</span>
                          </div>
                        )}
                        {meal.difficulty && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <ChefHat className="w-8 h-8" />
                            <span className="text-2xl font-medium capitalize">
                              {difficultyMap[meal.difficulty] || meal.difficulty}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 py-12">
                      <p className="text-3xl font-medium">Não planejado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </KioskPageLayout>
  )
}
