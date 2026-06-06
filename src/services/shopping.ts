import pb from '@/lib/pocketbase/client'

export interface ShoppingItem {
  id: string
  family_id: string
  name: string
  quantity: number
  unit: string
  category: string
  estimated_price: number
  is_purchased: boolean
  source: 'manual' | 'auto-generated'
  created: string
  updated: string
}

export const getShoppingItems = (familyId: string) =>
  pb
    .collection('shopping_items')
    .getFullList<ShoppingItem>({ filter: `family_id = "${familyId}"`, sort: '-created' })

export const createShoppingItem = (data: Partial<ShoppingItem>) =>
  pb.collection('shopping_items').create<ShoppingItem>(data)

export const updateShoppingItem = (id: string, data: Partial<ShoppingItem>) =>
  pb.collection('shopping_items').update<ShoppingItem>(id, data)

export const deleteShoppingItem = (id: string) => pb.collection('shopping_items').delete(id)

export const getPantryItems = (familyId: string) =>
  pb.collection('pantry').getFullList({ filter: `family_id = "${familyId}"` })

export const getMealsForWeek = (familyId: string, startDate: string, endDate: string) =>
  pb.collection('meals').getFullList({
    filter: `family_id = "${familyId}" && date >= "${startDate}" && date <= "${endDate}"`,
  })
