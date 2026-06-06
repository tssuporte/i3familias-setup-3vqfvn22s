import { useState, useEffect } from 'react'
import { calculateAge, getAgeGroup } from '@/utils/ageUtils'

export function useAgeGroup(birthDate: string | Date | undefined) {
  const [ageGroup, setAgeGroup] = useState<string>('standard')
  const [age, setAge] = useState<number>(0)

  useEffect(() => {
    if (!birthDate) return

    const updateAge = () => {
      const currentAge = calculateAge(birthDate)
      setAge(currentAge)
      setAgeGroup(getAgeGroup(currentAge))
    }

    updateAge()

    // Recalculate precisely at midnight to trigger automatic interface refresh
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeToMidnight = tomorrow.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      updateAge()
      setInterval(updateAge, 24 * 60 * 60 * 1000)
    }, timeToMidnight)

    return () => clearTimeout(timeout)
  }, [birthDate])

  return { age, ageGroup }
}
