import { useState, useEffect, useCallback } from 'react'
import { getMeals, generateMeals, type Meal } from '@/services/meals'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

export function useMealPlan(familyId: string, startDate: string, endDate: string) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const loadMeals = useCallback(async () => {
    if (!familyId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await getMeals(familyId, startDate, endDate)
      setMeals(data)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o cardápio.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [familyId, startDate, endDate, toast])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  useRealtime('meals', () => {
    loadMeals()
  })

  const generate = async () => {
    if (!familyId) return
    setIsGenerating(true)
    try {
      await generateMeals(familyId, startDate)
      toast({ title: 'Sucesso', description: 'Cardápio gerado com sucesso!' })
      await loadMeals()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o cardápio. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return { meals, isLoading, isGenerating, generate }
}
