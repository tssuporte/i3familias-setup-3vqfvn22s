import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMealPlan } from '@/hooks/use-meal-plan'
import { updateMeal, createMeal, deleteMeal, type Meal } from '@/services/meals'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import {
  Star,
  Clock,
  ChefHat,
  CheckCircle2,
  ArrowRightLeft,
  Edit,
  Plus,
  Coffee,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mealTypes = ['breakfast', 'lunch', 'dinner'] as const
type MealType = (typeof mealTypes)[number]
const mealLabels: Record<MealType, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
}

const mealIcons: Record<MealType, React.ElementType> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
}

const difficultyStyles = {
  easy: 'bg-green-100 text-green-600 border-l-2 border-green-500 dark:bg-green-900/30 dark:text-green-400',
  medium:
    'bg-yellow-100 text-yellow-600 border-l-2 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-600 border-l-2 border-red-500 dark:bg-red-900/30 dark:text-red-400',
}

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

export default function Meals() {
  const { toast } = useToast()
  const [familyId, setFamilyId] = useState<string>('')

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  const startDateStr = format(days[0], 'yyyy-MM-dd')
  const endDateStr = format(days[6], 'yyyy-MM-dd')

  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState<Date>(days[0])
  const [swapSource, setSwapSource] = useState<Meal | null>(null)
  const [editState, setEditState] = useState<{
    isOpen: boolean
    meal?: Meal
    date?: string
    type?: MealType
  }>({ isOpen: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    pb.collection('families')
      .getFullList()
      .then((res) => {
        if (res.length > 0) setFamilyId(res[0].id)
      })
  }, [])

  const { meals, isLoading, isGenerating, generate } = useMealPlan(
    familyId,
    startDateStr,
    endDateStr,
  )

  const getMeal = (day: Date, type: MealType) => {
    return meals.find((m) => m.date.startsWith(format(day, 'yyyy-MM-dd')) && m.meal_type === type)
  }

  const handleSwapTarget = async (dateStr: string, mealType: MealType, existingMeal?: Meal) => {
    if (!swapSource) return
    if (existingMeal && existingMeal.id === swapSource.id) {
      setSwapSource(null)
      return
    }
    try {
      if (existingMeal) {
        await Promise.all([
          updateMeal(swapSource.id, { date: existingMeal.date, meal_type: existingMeal.meal_type }),
          updateMeal(existingMeal.id, { date: swapSource.date, meal_type: swapSource.meal_type }),
        ])
      } else {
        await updateMeal(swapSource.id, { date: dateStr, meal_type: mealType })
      }
      toast({ title: 'Sucesso', description: 'Refeições movidas com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao mover refeições.', variant: 'destructive' })
    }
    setSwapSource(null)
  }

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const data = {
      dish: fd.get('dish') as string,
      prep_time: Number(fd.get('prep_time')),
      difficulty: fd.get('difficulty') as any,
      ingredients: (fd.get('ingredients') as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    try {
      if (editState.meal) {
        await updateMeal(editState.meal.id, data)
      } else {
        await createMeal({
          ...data,
          family_id: familyId,
          date: editState.date!,
          meal_type: editState.type!,
        })
      }
      toast({ title: 'Salvo', description: 'Refeição salva com sucesso.' })
      setEditState({ isOpen: false })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar a refeição.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCell = (day: Date, type: MealType) => {
    const meal = getMeal(day, type)
    const isSwapTargetMode = !!swapSource && swapSource?.id !== meal?.id
    const isSwapSource = swapSource?.id === meal?.id

    if (!meal) {
      return (
        <div
          key={`${day.toISOString()}-${type}`}
          className={cn(
            'min-h-24 border border-dashed rounded-md p-3 flex flex-col items-center justify-center text-muted-foreground transition-colors h-full',
            isSwapTargetMode
              ? 'border-primary bg-primary/5 cursor-pointer ring-2 ring-primary ring-offset-1'
              : 'hover:bg-accent/50 cursor-pointer',
          )}
          onClick={() => {
            if (isSwapTargetMode)
              handleSwapTarget(`${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`, type)
            else
              setEditState({
                isOpen: true,
                date: `${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`,
                type,
              })
          }}
        >
          {isSwapTargetMode ? (
            <span className="text-sm text-primary font-medium text-center leading-tight">
              Mover para cá
            </span>
          ) : (
            <>
              <Plus className="w-5 h-5 mb-1 opacity-50" />
              <span className="text-xs font-medium opacity-70">Adicionar</span>
            </>
          )}
        </div>
      )
    }

    return (
      <div
        key={meal.id}
        onClick={() =>
          isSwapTargetMode &&
          handleSwapTarget(`${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`, type, meal)
        }
        className={cn(
          'min-h-24 border border-solid rounded-md p-3 bg-card shadow-sm flex flex-col relative transition-all group h-full',
          isSwapTargetMode
            ? 'cursor-pointer border-primary ring-2 ring-primary ring-offset-1'
            : 'hover:shadow-md',
          isSwapSource && 'opacity-50 ring-2 ring-dashed ring-muted-foreground',
          meal.is_cooked && 'bg-muted/30 border-muted opacity-80',
        )}
      >
        <div className="text-[16px] font-bold text-primary mb-2 leading-tight pr-6 line-clamp-2">
          {meal.dish}
        </div>

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditState({ isOpen: true, meal })
            }}
            className="p-1.5 bg-background/90 backdrop-blur rounded-md border shadow-sm hover:bg-accent"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSwapSource(meal)
            }}
            className="p-1.5 bg-background/90 backdrop-blur rounded-md border shadow-sm hover:bg-accent"
            title="Mover / Trocar"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 mt-auto">
          <span className="text-[12px] text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" /> {meal.prep_time}m
          </span>
          <div
            className={cn(
              'text-[12px] px-1.5 py-0.5 font-semibold rounded-sm',
              difficultyStyles[meal.difficulty],
            )}
          >
            {difficultyLabels[meal.difficulty]}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              const nextRating = ((meal.family_rating || 0) % 5) + 1
              updateMeal(meal.id, { family_rating: nextRating })
            }}
            className="flex items-center gap-1 hover:bg-accent px-1.5 py-0.5 rounded transition-colors -ml-1.5"
            title="Clique para avaliar"
          >
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-[12px] font-bold text-accent">{meal.family_rating || 0}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              updateMeal(meal.id, { is_cooked: !meal.is_cooked })
            }}
            className={cn(
              'text-[11px] font-bold px-2 py-1 rounded transition-colors -mr-1.5',
              meal.is_cooked
                ? 'text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400'
                : 'text-muted-foreground bg-muted hover:bg-accent hover:text-foreground',
            )}
          >
            {meal.is_cooked ? (
              <>
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Feito
              </>
            ) : (
              'Marcar'
            )}
          </button>
        </div>
      </div>
    )
  }

  const renderDayView = (day: Date) => (
    <div className="flex flex-col gap-4 px-1 pb-4">
      <div className="text-center md:hidden mb-2">
        <div className="text-2xl font-bold capitalize text-primary">
          {format(day, 'EEEE', { locale: ptBR })}
        </div>
        <div className="text-sm font-medium text-muted-foreground">{format(day, 'dd/MM/yyyy')}</div>
      </div>
      {mealTypes.map((type) => {
        const meal = getMeal(day, type)
        const Icon = mealIcons[type]

        return (
          <div
            key={type}
            className="border rounded-xl p-4 md:p-6 bg-card shadow-sm flex flex-col relative transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                {mealLabels[type]}
              </span>
            </div>

            {meal ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    {meal.dish}
                  </h3>
                  <button
                    onClick={() => setEditState({ isOpen: true, meal })}
                    className="p-2 border rounded-md hover:bg-accent text-muted-foreground shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium bg-accent/50 px-2.5 py-1 rounded-md">
                    <Clock className="w-4 h-4" /> {meal.prep_time} min
                  </span>
                  <div
                    className={cn(
                      'text-sm px-2.5 py-1 font-semibold rounded-md flex items-center',
                      difficultyStyles[meal.difficulty],
                    )}
                  >
                    {difficultyLabels[meal.difficulty]}
                  </div>
                  <button
                    onClick={() =>
                      updateMeal(meal.id, { family_rating: ((meal.family_rating || 0) % 5) + 1 })
                    }
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 transition-colors px-2.5 py-1 rounded-md text-amber-700 dark:text-amber-400 text-sm font-bold"
                  >
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {meal.family_rating || 0}/5
                  </button>
                </div>

                {meal.ingredients?.length > 0 && (
                  <div className="bg-accent/30 rounded-lg p-4 mt-2">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-muted-foreground" /> Ingredientes
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                          <span className="line-clamp-2">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 mt-2 flex justify-end">
                  <Button
                    variant={meal.is_cooked ? 'outline' : 'default'}
                    className={cn(
                      'gap-2 w-full sm:w-auto transition-colors',
                      meal.is_cooked &&
                        'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
                    )}
                    onClick={() => updateMeal(meal.id, { is_cooked: !meal.is_cooked })}
                  >
                    {meal.is_cooked ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {meal.is_cooked ? 'Prato Concluído' : 'Marcar como Feito'}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="py-10 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() =>
                  setEditState({
                    isOpen: true,
                    date: `${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`,
                    type,
                  })
                }
              >
                <Plus className="w-8 h-8 mb-3 opacity-40" />
                <span className="font-medium text-sm">
                  Adicionar {mealLabels[type].toLowerCase()}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (meals.length === 0 && !isLoading && !isGenerating) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio da Semana</h1>
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-6 bg-card rounded-lg border shadow-sm">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-muted-foreground opacity-50" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Nenhum cardápio gerado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Crie um plano inteligente usando IA. Baseado na sua despensa e restrições familiares.
            </p>
          </div>
          <Button
            size="lg"
            onClick={generate}
            disabled={!familyId}
            className={cn(
              'gap-2 bg-primary text-primary-foreground',
              !familyId &&
                'bg-gray-400 text-gray-200 cursor-not-allowed hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-400 hover:dark:bg-gray-700',
            )}
          >
            <ChefHat className="w-5 h-5" /> Gerar Cardápio Inteligente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio da Semana</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="hidden md:flex items-center space-x-2 bg-card border px-3 py-1.5 rounded-full">
            <Label
              className={cn(
                viewMode === 'day' ? 'text-primary' : 'text-muted-foreground',
                'cursor-pointer',
              )}
              onClick={() => setViewMode('day')}
            >
              Dia
            </Label>
            <Switch
              checked={viewMode === 'week'}
              onCheckedChange={(c) => setViewMode(c ? 'week' : 'day')}
            />
            <Label
              className={cn(
                viewMode === 'week' ? 'text-primary' : 'text-muted-foreground',
                'cursor-pointer',
              )}
              onClick={() => setViewMode('week')}
            >
              Semana
            </Label>
          </div>
          <Button
            onClick={generate}
            disabled={isGenerating || !familyId}
            className={cn(
              'gap-2 w-full sm:w-auto bg-primary text-primary-foreground',
              (isGenerating || !familyId) &&
                'bg-gray-400 text-gray-200 cursor-not-allowed hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-400 hover:dark:bg-gray-700',
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChefHat className="w-4 h-4" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar Cardápio'}
          </Button>
        </div>
      </div>

      {isLoading || isGenerating ? (
        <>
          <div className="hidden md:grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-4 animate-pulse">
            <div className="p-2" />
            {days.map((_, i) => (
              <div key={`h-${i}`} className="space-y-2 pb-2 flex flex-col items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
            {mealTypes.map((type) => (
              <React.Fragment key={`r-${type}`}>
                <div className="flex items-start gap-2 pt-4">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {days.map((_, i) => (
                  <Skeleton key={`c-${type}-${i}`} className="h-28 w-full rounded-md" />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="md:hidden space-y-4 animate-pulse px-2">
            <Skeleton className="h-8 w-40 mx-auto mb-6" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </>
      ) : (
        <>
          {/* Mobile Swipeable View */}
          <div className="block md:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {days.map((day) => (
                  <CarouselItem key={day.toISOString()}>{renderDayView(day)}</CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="mt-2 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <ArrowRightLeft className="w-4 h-4 opacity-50" /> Deslize para ver a semana
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            {viewMode === 'week' ? (
              <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-4 items-stretch">
                <div className="p-2" />
                {days.map((day) => (
                  <div key={day.toISOString()} className="text-center pb-2">
                    <div className="font-bold capitalize text-base">
                      {format(day, 'EEEE', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {format(day, 'dd/MM')}
                    </div>
                  </div>
                ))}
                {mealTypes.map((type) => {
                  const Icon = mealIcons[type]
                  return (
                    <React.Fragment key={type}>
                      <div className="flex items-start justify-start pt-4 gap-2">
                        <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-sm leading-tight mt-0.5">
                          {mealLabels[type]}
                        </span>
                      </div>
                      {days.map((day) => renderCell(day, type))}
                    </React.Fragment>
                  )
                })}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-hide">
                  {days.map((day) => (
                    <Button
                      key={day.toISOString()}
                      variant={isSameDay(selectedDate, day) ? 'default' : 'outline'}
                      onClick={() => setSelectedDate(day)}
                      className="flex-1 min-w-fit"
                    >
                      {format(day, 'EEEE', { locale: ptBR })}
                    </Button>
                  ))}
                </div>
                {renderDayView(selectedDate)}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog
        open={editState.isOpen}
        onOpenChange={(open) => !open && setEditState({ isOpen: false })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editState.meal ? 'Editar Refeição' : 'Adicionar Refeição'}</DialogTitle>
          </DialogHeader>
          <form
            key={editState.meal?.id || 'new'}
            onSubmit={handleSaveEdit}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label>Prato</Label>
              <Input name="dish" required defaultValue={editState.meal?.dish} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo (min)</Label>
                <Input
                  name="prep_time"
                  type="number"
                  min="1"
                  required
                  defaultValue={editState.meal?.prep_time || 30}
                />
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select name="difficulty" defaultValue={editState.meal?.difficulty || 'medium'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ingredientes (separados por vírgula)</Label>
              <Textarea
                name="ingredients"
                rows={4}
                defaultValue={editState.meal?.ingredients?.join(', ')}
                placeholder="Arroz, Feijão, Frango..."
              />
            </div>
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <div className="flex justify-between w-full">
                {editState.meal ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      await deleteMeal(editState.meal!.id)
                      setEditState({ isOpen: false })
                      toast({ title: 'Removido', description: 'Refeição excluída.' })
                    }}
                  >
                    Remover
                  </Button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditState({ isOpen: false })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
