import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { useFamily } from '@/contexts/FamilyContext'

export const settingsSchema = z.object({
  familyName: z.string().min(3, 'Mínimo de 3 caracteres').max(50, 'Máximo de 50 caracteres'),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  darkMode: z.boolean(),
  globalNotifications: z.boolean(),

  starDefaultValue: z.coerce.number().min(0).max(9999),
  starLatePenalty: z.coerce.number().min(0).max(9999),
  starDishonestyPenalty: z.coerce.number().min(0).max(9999),
  starMaxLimit: z.coerce.number().min(0).max(9999),
  starMonthlyReset: z.boolean(),

  mealAutoGenerate: z.boolean(),
  mealDays: z.coerce.number().min(0).max(9999),
  pantryExpiryAlertDays: z.coerce.number().min(0).max(9999),
  pantryMinStock: z.coerce.number().min(0).max(9999),
  pantryCustomCategories: z.string().transform((val) =>
    val
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .join(', '),
  ),

  notifyUpcomingTasks: z.boolean(),
  notifyTaskHoursBefore: z.coerce.number().min(0).max(9999),
  notifyStarsEarned: z.boolean(),
  notifyPantryExpiry: z.boolean(),
  notifyMealReady: z.boolean(),
  dailySummaryTime: z.string(),
})

export type SettingsValues = z.infer<typeof settingsSchema>

const defaultValues: SettingsValues = {
  familyName: '',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  language: 'Portugues',
  darkMode: false,
  globalNotifications: true,
  starDefaultValue: 5,
  starLatePenalty: 2,
  starDishonestyPenalty: 5,
  starMaxLimit: 1000,
  starMonthlyReset: false,
  mealAutoGenerate: false,
  mealDays: 7,
  pantryExpiryAlertDays: 3,
  pantryMinStock: 5,
  pantryCustomCategories: '',
  notifyUpcomingTasks: true,
  notifyTaskHoursBefore: 2,
  notifyStarsEarned: true,
  notifyPantryExpiry: true,
  notifyMealReady: true,
  dailySummaryTime: '20:00',
}

export function useSettings() {
  const { family, refreshFamily } = useFamily()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SettingsValues>(defaultValues)

  const loadSettings = useCallback(async () => {
    if (!family) return
    setLoading(true)
    try {
      const record = await pb
        .collection('family_settings')
        .getFirstListItem(`family_id="${family.id}" && setting_key="global"`)
        .catch(() => null)

      const vals = record?.setting_value || {}
      setSettings({
        ...defaultValues,
        ...vals,
        familyName: family.name || '',
        timezone: family.timezone || 'America/Sao_Paulo',
        currency: family.currency || 'BRL',
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [family])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async (data: SettingsValues) => {
    if (!family) return

    if (
      family.name !== data.familyName ||
      family.timezone !== data.timezone ||
      family.currency !== data.currency
    ) {
      await pb.collection('families').update(family.id, {
        name: data.familyName,
        timezone: data.timezone,
        currency: data.currency,
      })
      await refreshFamily()
    }

    const { familyName, timezone, currency, ...settingValue } = data

    const existing = await pb
      .collection('family_settings')
      .getFirstListItem(`family_id="${family.id}" && setting_key="global"`)
      .catch(() => null)

    if (existing) {
      await pb.collection('family_settings').update(existing.id, { setting_value: settingValue })
    } else {
      await pb.collection('family_settings').create({
        family_id: family.id,
        setting_key: 'global',
        setting_value: settingValue,
      })
    }
  }

  return { loading, settings, saveSettings }
}
