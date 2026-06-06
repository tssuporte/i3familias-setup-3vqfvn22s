import { useState, useEffect, useMemo, useCallback } from 'react'
import { useFamily } from '@/contexts/FamilyContext'
import {
  getShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  getPantryItems,
  getMealsForWeek,
  ShoppingItem,
} from '@/services/shopping'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export function useShoppingList() {
  const { currentFamily } = useFamily()
  const { toast } = useToast()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budget = (currentFamily as any)?.shopping_budget || 500

  const fetchItems = useCallback(async () => {
    if (!currentFamily) return
    try {
      const data = await getShoppingItems(currentFamily.id)
      setItems(data)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar lista.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [currentFamily, toast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useRealtime<ShoppingItem>('shopping_items', () => {
    fetchItems()
  })

  const addItem = async (data: Partial<ShoppingItem>) => {
    if (!currentFamily) return
    try {
      await createShoppingItem({ ...data, family_id: currentFamily.id, source: 'manual' })
      toast({ title: 'Sucesso', description: 'Item adicionado com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao adicionar item.', variant: 'destructive' })
      throw err
    }
  }

  const updateItem = async (id: string, data: Partial<ShoppingItem>) => {
    try {
      await updateShoppingItem(id, data)
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao atualizar item.', variant: 'destructive' })
      throw err
    }
  }

  const removeItem = async (id: string) => {
    try {
      await deleteShoppingItem(id)
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao remover item.', variant: 'destructive' })
      throw err
    }
  }

  const clearPurchased = async () => {
    const purchased = items.filter((i) => i.is_purchased)
    if (purchased.length === 0) return
    try {
      await Promise.all(purchased.map((i) => deleteShoppingItem(i.id)))
      toast({ title: 'Sucesso', description: 'Itens comprados removidos.' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover itens comprados.',
        variant: 'destructive',
      })
    }
  }

  const generateList = async () => {
    if (!currentFamily) return
    setGenerating(true)
    try {
      const pantry = await getPantryItems(currentFamily.id)
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)

      const meals = await getMealsForWeek(
        currentFamily.id,
        today.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0],
      )

      const toAdd: { name: string; quantity: number; unit: string; category: string }[] = []

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pantry.forEach((p: any) => {
        if (p.min_stock > 0 && p.quantity <= p.min_stock) {
          toAdd.push({
            name: p.name,
            quantity: p.min_stock - p.quantity + 1,
            unit: p.unit,
            category: p.category || 'Mercearia',
          })
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meals.forEach((m: any) => {
        if (m.ingredients && Array.isArray(m.ingredients)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.ingredients.forEach((ing: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inPantry = pantry.find(
              (p: any) => p.name.toLowerCase() === ing.name.toLowerCase(),
            )
            if (!inPantry || inPantry.quantity < ing.quantity) {
              toAdd.push({
                name: ing.name,
                quantity: ing.quantity - (inPantry ? inPantry.quantity : 0),
                unit: ing.unit || 'un',
                category: 'Ingredientes',
              })
            }
          })
        }
      })

      const existingPending = items.filter((i) => !i.is_purchased).map((i) => i.name.toLowerCase())
      const filteredToAdd = toAdd.filter((i) => !existingPending.includes(i.name.toLowerCase()))

      if (filteredToAdd.length === 0) {
        toast({ title: 'Aviso', description: 'Nenhum item novo necessário no momento.' })
      } else {
        await Promise.all(
          filteredToAdd.map((item) =>
            createShoppingItem({
              ...item,
              family_id: currentFamily.id,
              source: 'auto-generated',
              estimated_price: 0,
              is_purchased: false,
            }),
          ),
        )
        toast({
          title: 'Sucesso',
          description: `${filteredToAdd.length} itens adicionados automaticamente!`,
        })
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao gerar lista.', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const totalCost = useMemo(
    () => items.reduce((acc, item) => acc + (item.estimated_price || 0), 0),
    [items],
  )

  return {
    items,
    loading,
    generating,
    budget,
    totalCost,
    addItem,
    updateItem,
    removeItem,
    clearPurchased,
    generateList,
  }
}
