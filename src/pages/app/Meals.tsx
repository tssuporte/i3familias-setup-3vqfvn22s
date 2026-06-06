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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Star, Clock, ChefHat, CheckCircle2, ArrowRightLeft, Edit, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const mealTypes = ['breakfast', 'lunch', 'dinner'] as const
type MealType = (typeof mealTypes)[number]
const mealLabels: Record<MealType, string> = {
  breakfast: 'Café',
  lunch: 'Almoço',
  dinner: 'Jantar',
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4 cursor-pointer transition-colors',
            (hover || value) >= star
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground hover:text-yellow-200',
          )}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={(e) => {
            e.stopPropagation()
            onChange(star)
          }}
        />
      ))}
    </div>
  )
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
      toast({ title: 'Trocado', description: 'Refeições trocadas com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao trocar refeições.', variant: 'destructive' })
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

  if (meals.length === 0 && !isLoading && !isGenerating) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio da Semana</h1>
        <div className="text-center py-20 space-y-6 bg-card rounded-lg border shadow-sm">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Nenhum cardápio gerado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Crie um plano inteligente usando IA. Baseado na sua despensa e restrições familiares.
            </p>
          </div>
          <Button size="lg" onClick={generate} disabled={!familyId} className="gap-2">
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
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-card border px-3 py-1.5 rounded-full">
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
          <Button onClick={generate} disabled={isGenerating || !familyId} className="gap-2">
            {isGenerating ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <ChefHat className="w-4 h-4" />
            )}
            Gerar Cardápio
          </Button>
        </div>
      </div>

      {isLoading || isGenerating ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-4 animate-pulse">
          {days.map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn('w-full transition-all', viewMode === 'day' && 'max-w-2xl mx-auto')}>
          {viewMode === 'day' && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {days.map((day) => (
                <Button
                  key={day.toISOString()}
                  variant={isSameDay(selectedDate, day) ? 'default' : 'outline'}
                  onClick={() => setSelectedDate(day)}
                  className="min-w-fit"
                >
                  {format(day, 'EEE, dd/MM', { locale: ptBR })}
                </Button>
              ))}
            </div>
          )}

          <div
            className={cn(
              viewMode === 'week'
                ? 'grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-4'
                : 'flex flex-col gap-4',
            )}
          >
            {(viewMode === 'day' ? [selectedDate] : days).map((day) => (
              <div key={day.toISOString()} className="flex flex-col gap-3 min-w-[260px] lg:min-w-0">
                {viewMode === 'week' && (
                  <>
                    <h3 className="font-semibold text-center capitalize">
                      {format(day, 'EEEE', { locale: ptBR })}
                    </h3>
                    <div className="text-xs text-center text-muted-foreground -mt-2 mb-2">
                      {format(day, 'dd/MM')}
                    </div>
                  </>
                )}

                {mealTypes.map((type) => {
                  const meal = meals.find(
                    (m) => m.date.startsWith(format(day, 'yyyy-MM-dd')) && m.meal_type === type,
                  )
                  const isSwapSource = swapSource?.id === meal?.id && meal !== undefined
                  const isSwapTargetMode = !!swapSource && !isSwapSource

                  if (!meal) {
                    return (
                      <Card
                        key={type}
                        className={cn(
                          'min-h-[140px] flex flex-col border-dashed bg-muted/30 transition-all',
                          isSwapTargetMode &&
                            'ring-2 ring-primary ring-offset-2 cursor-pointer border-solid bg-accent/50',
                        )}
                        onClick={() =>
                          isSwapTargetMode &&
                          handleSwapTarget(`${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`, type)
                        }
                      >
                        <CardHeader className="p-3 pb-2">
                          <Badge variant="secondary" className="w-fit">
                            {mealLabels[type]}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 flex-grow flex items-center justify-center">
                          {isSwapTargetMode ? (
                            <span className="text-sm text-primary font-medium">Mover para cá</span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditState({
                                  isOpen: true,
                                  date: `${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`,
                                  type,
                                })
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" /> Adicionar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  }

                  return (
                    <Card
                      key={meal.id}
                      className={cn(
                        'relative transition-all duration-200 flex flex-col h-full',
                        isSwapTargetMode &&
                          'ring-2 ring-primary ring-offset-2 cursor-pointer hover:bg-accent/50',
                        isSwapSource && 'opacity-50 ring-2 ring-dashed ring-muted-foreground',
                        meal.is_cooked && 'bg-muted/50',
                      )}
                      onClick={() =>
                        isSwapTargetMode &&
                        handleSwapTarget(`${format(day, 'yyyy-MM-dd')} 12:00:00.000Z`, type, meal)
                      }
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline">{mealLabels[type]}</Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditState({ isOpen: true, meal })
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSwapSource(meal)
                                toast({
                                  title: 'Trocar Refeição',
                                  description: 'Selecione o novo local.',
                                })
                              }}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle
                          className={cn(
                            'mt-2',
                            viewMode === 'day' ? 'text-xl' : 'text-base leading-tight',
                          )}
                        >
                          {meal.dish}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 space-y-3 flex-grow">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {meal.prep_time}m
                          </span>
                          <span className="flex items-center gap-1">
                            <ChefHat className="w-3 h-3" /> {meal.difficulty}
                          </span>
                        </div>
                        {viewMode === 'day' && meal.ingredients?.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Ingredientes:</span>
                            <ul className="list-disc pl-4 mt-1 text-muted-foreground">
                              {meal.ingredients.map((ing, idx) => (
                                <li key={idx}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 pt-3 mt-3 border-t">
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                            Avaliação da Família
                          </span>
                          <StarRating
                            value={meal.family_rating || 0}
                            onChange={(v) => updateMeal(meal.id, { family_rating: v })}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <Button
                          size="sm"
                          variant={meal.is_cooked ? 'default' : 'outline'}
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateMeal(meal.id, { is_cooked: !meal.is_cooked })
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />{' '}
                          {meal.is_cooked ? 'Feito' : 'Marcar como feito'}
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
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
                rows={3}
                defaultValue={editState.meal?.ingredients?.join(', ')}
              />
            </div>
            <DialogFooter className="pt-4 border-t">
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
