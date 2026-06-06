import pb from '@/lib/pocketbase/client'

export interface Meal {
  id: string
  family_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  dish: string
  ingredients: string[]
  prep_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  family_rating: number
  is_cooked: boolean
}

export const getMeals = (familyId: string, startDate: string, endDate: string) =>
  pb.collection('meals').getFullList<Meal>({
    filter: `family_id = "${familyId}" && date >= "${startDate} 00:00:00" && date <= "${endDate} 23:59:59"`,
    sort: 'date,meal_type',
  })

export const updateMeal = (id: string, data: Partial<Meal>) =>
  pb.collection('meals').update<Meal>(id, data)

export const createMeal = (data: Partial<Meal>) => pb.collection('meals').create<Meal>(data)

export const deleteMeal = (id: string) => pb.collection('meals').delete(id)

export const generateMeals = (familyId: string, startDate: string) =>
  pb.send('/backend/v1/meals/generate', {
    method: 'POST',
    body: JSON.stringify({ family_id: familyId, start_date: startDate }),
    headers: { 'Content-Type': 'application/json' },
  })
