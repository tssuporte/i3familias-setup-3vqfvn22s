import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useFamily } from '@/contexts/FamilyContext'
import {
  getPantryItems,
  createPantryItem,
  updatePantryItem,
  deletePantryItem,
  type PantryItem,
} from '@/services/pantry'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

export function usePantry() {
  const familyCtx = useFamily() as any
  const familyId = familyCtx.currentFamily?.id || familyCtx.family?.id
  const { toast } = useToast()

  const [items, setItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!familyId) return
    try {
      setLoading(true)
      const data = await getPantryItems(familyId)
      setItems(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a despensa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [familyId, toast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useRealtime('pantry', fetchItems, !!familyId)

  const addItem = async (data: Partial<PantryItem>) => {
    try {
      await createPantryItem({ ...data, family_id: familyId })
      toast({ title: 'Sucesso', description: 'Item adicionado com sucesso!' })
      return { success: true }
    } catch (err: any) {
      return { success: false, errors: extractFieldErrors(err) }
    }
  }

  const editItem = async (id: string, data: Partial<PantryItem>) => {
    try {
      await updatePantryItem(id, data)
      toast({ title: 'Sucesso', description: 'Item atualizado com sucesso!' })
      return { success: true }
    } catch (err: any) {
      return { success: false, errors: extractFieldErrors(err) }
    }
  }

  const removeItem = async (id: string) => {
    try {
      await deletePantryItem(id)
      toast({ title: 'Sucesso', description: 'Item removido com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Falha ao remover item.', variant: 'destructive' })
    }
  }

  const updateQuantity = async (id: string, currentQty: number) => {
    if (currentQty <= 0) return
    try {
      await updatePantryItem(id, { quantity: currentQty - 1 })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar quantidade.',
        variant: 'destructive',
      })
    }
  }

  return {
    items,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    updateQuantity,
  }
}
