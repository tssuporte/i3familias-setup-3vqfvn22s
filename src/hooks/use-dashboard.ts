import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { startOfWeek, startOfMonth, isAfter, parseISO, format } from 'date-fns'

export type DateRange = 'week' | 'month' | 'all'

export function useDashboard(dateRange: DateRange) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [members, setMembers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const family = await pb.collection('families').getFirstListItem('')
        const familyId = family.id

        const [m, t, st, rr] = await Promise.all([
          pb
            .collection('family_members')
            .getFullList({ filter: `family_id = "${familyId}" && member_type = "child"` }),
          pb
            .collection('tasks_children')
            .getFullList({ filter: `family_id = "${familyId}"`, expand: 'assigned_to' }),
          pb
            .collection('stars_transactions')
            .getFullList({ filter: `family_id = "${familyId}"`, expand: 'member_id' }),
          pb.collection('rewards_redemptions').getFullList({ filter: `family_id = "${familyId}"` }),
        ])
        setMembers(m)
        setTasks(t)
        setTransactions(st)
        setRedemptions(rr)
        setError(null)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const aggregatedData = useMemo(() => {
    let startDate: Date | null = null
    const now = new Date()
    if (dateRange === 'week') startDate = startOfWeek(now, { weekStartsOn: 0 })
    if (dateRange === 'month') startDate = startOfMonth(now)

    const isWithinRange = (dateString: string) => {
      if (!startDate) return true
      if (!dateString) return false
      return isAfter(parseISO(dateString), startDate)
    }

    const rangeTransactions = transactions.filter((tr) => isWithinRange(tr.created))
    const totalStars = rangeTransactions
      .filter((tr) => tr.transaction_type === 'earned')
      .reduce((sum, tr) => sum + (tr.amount || 0), 0)

    const assignedTasks = tasks.filter((t) => isWithinRange(t.created))
    const completedTasks = tasks.filter(
      (t) => t.status === 'completed' && isWithinRange(t.completed_at || t.updated),
    )

    const completionRate =
      assignedTasks.length > 0
        ? Math.round((completedTasks.length / assignedTasks.length) * 100)
        : 0

    const rangeRedemptions = redemptions.filter((r) => isWithinRange(r.created))
    const redeemedRewards = rangeRedemptions.filter((r) => r.status === 'approved').length

    const starsPerChildMap: Record<string, number> = {}
    members.forEach((m) => (starsPerChildMap[m.name] = 0))
    rangeTransactions.forEach((tr) => {
      if (tr.transaction_type === 'earned' && tr.expand?.member_id) {
        const name = tr.expand.member_id.name
        if (starsPerChildMap[name] !== undefined) {
          starsPerChildMap[name] += tr.amount || 0
        }
      }
    })
    const starsPerChild = Object.entries(starsPerChildMap).map(([name, stars]) => ({ name, stars }))

    const tasksPerTypeMap: Record<string, number> = {}
    assignedTasks.forEach((t) => {
      const type = t.recurrence || 'once'
      const label =
        type === 'once'
          ? 'Única'
          : type === 'daily'
            ? 'Diária'
            : type === 'weekly'
              ? 'Semanal'
              : 'Customizada'
      tasksPerTypeMap[label] = (tasksPerTypeMap[label] || 0) + 1
    })
    const tasksPerType = Object.entries(tasksPerTypeMap).map(([name, value]) => ({ name, value }))

    const activityMap: Record<string, number> = {}
    completedTasks.forEach((t) => {
      const date = t.completed_at
        ? format(parseISO(t.completed_at), 'dd/MM')
        : format(parseISO(t.updated), 'dd/MM')
      activityMap[date] = (activityMap[date] || 0) + 1
    })
    const activityWeekly = Object.entries(activityMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))

    const upcomingTasks = tasks
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => (a.due_time || '23:59').localeCompare(b.due_time || '23:59'))
      .slice(0, 5)

    const mostActiveChildren = [...starsPerChild].sort((a, b) => b.stars - a.stars).slice(0, 3)

    return {
      totalStars,
      completedTasksCount: completedTasks.length,
      completionRate,
      redeemedRewards,
      starsPerChild,
      tasksPerType,
      activityWeekly,
      upcomingTasks,
      mostActiveChildren,
      isEmpty: tasks.length === 0 && transactions.length === 0,
    }
  }, [dateRange, members, tasks, transactions, redemptions])

  return { loading, error, ...aggregatedData }
}
