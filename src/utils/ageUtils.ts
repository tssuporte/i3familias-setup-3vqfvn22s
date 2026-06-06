import { differenceInYears } from 'date-fns'

export function calculateAge(birth_date: string | Date): number {
  if (!birth_date) return 0
  return differenceInYears(new Date(), new Date(birth_date))
}

export function getAgeGroup(age: number): string {
  if (age >= 0 && age <= 3) return '0-3'
  if (age >= 4 && age <= 5) return '4-5'
  if (age >= 6 && age <= 9) return '6-9'
  if (age >= 10 && age <= 12) return '10-12'
  return '13+'
}

export function getInterfaceType(age: number): string {
  const group = getAgeGroup(age)
  if (group === '0-3' || group === '4-5') return 'picture_based'
  if (group === '6-9' || group === '10-12') return 'simplified'
  return 'standard'
}
