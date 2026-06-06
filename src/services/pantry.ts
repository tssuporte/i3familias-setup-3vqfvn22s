import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface PantryItem extends RecordModel {
  id: string
  family_id: string
  name: string
  quantity: number
  unit: string
  location?: string
  expiry_date?: string
  min_stock?: number
  category?: string
  created: string
  updated: string
}

export const getPantryItems = (familyId: string) =>
  pb.collection<PantryItem>('pantry').getFullList({
    filter: `family_id = "${familyId}"`,
    sort: 'expiry_date',
  })

export const createPantryItem = (data: Partial<PantryItem>) =>
  pb.collection<PantryItem>('pantry').create(data)

export const updatePantryItem = (id: string, data: Partial<PantryItem>) =>
  pb.collection<PantryItem>('pantry').update(id, data)

export const deletePantryItem = (id: string) => pb.collection<PantryItem>('pantry').delete(id)
