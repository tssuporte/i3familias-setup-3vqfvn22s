import pb from '@/lib/pocketbase/client'

export const getOrCreateStarsLevel = async (familyId: string, memberId: string) => {
  try {
    const records = await pb.collection('stars_levels').getFullList({
      filter: `member_id = "${memberId}"`,
    })
    if (records.length > 0) return records[0]

    return await pb.collection('stars_levels').create({
      family_id: familyId,
      member_id: memberId,
      stars_total_earned: 0,
      stars_balance: 0,
      current_level: 1,
    })
  } catch (err) {
    throw new Error('Erro ao buscar o nível de estrelas.')
  }
}

export const getRewards = async (familyId: string) => {
  try {
    return await pb.collection('rewards').getFullList({
      filter: `family_id = "${familyId}"`,
      sort: 'cost',
    })
  } catch (err) {
    throw new Error('Erro ao carregar as recompensas.')
  }
}

export const requestReward = async (familyId: string, memberId: string, rewardId: string) => {
  try {
    return await pb.collection('rewards_redemptions').create({
      family_id: familyId,
      member_id: memberId,
      reward_id: rewardId,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })
  } catch (err) {
    throw new Error('Erro ao solicitar a recompensa.')
  }
}

export const getPendingRedemptions = async (familyId: string) => {
  try {
    return await pb.collection('rewards_redemptions').getFullList({
      filter: `family_id = "${familyId}" && status = "pending"`,
      expand: 'member_id,reward_id',
      sort: '-requested_at',
    })
  } catch (err) {
    throw new Error('Erro ao buscar resgates pendentes.')
  }
}

export const calculateLevel = (totalEarned: number) => {
  if (totalEarned >= 1000) return 5
  if (totalEarned >= 500) return 4
  if (totalEarned >= 250) return 3
  if (totalEarned >= 100) return 2
  return 1
}

export const addStars = async (
  familyId: string,
  memberId: string,
  amount: number,
  reason: string,
  relatedTaskId?: string,
) => {
  try {
    const levelRecord = await getOrCreateStarsLevel(familyId, memberId)
    const newTotal = (levelRecord.stars_total_earned || 0) + amount
    const newBalance = (levelRecord.stars_balance || 0) + amount
    const newLevel = calculateLevel(newTotal)

    await pb.collection('stars_levels').update(levelRecord.id, {
      stars_total_earned: newTotal,
      stars_balance: newBalance,
      current_level: newLevel,
    })

    await pb.collection('stars_transactions').create({
      family_id: familyId,
      member_id: memberId,
      transaction_type: 'earned',
      amount: amount,
      reason: reason,
      related_task_id: relatedTaskId || null,
    })
  } catch (err) {
    throw new Error('Erro ao adicionar estrelas.')
  }
}

export const deductStars = async (
  familyId: string,
  memberId: string,
  amount: number,
  reason: string,
  transactionType: 'spent' | 'penalty' = 'spent',
) => {
  try {
    const levelRecord = await getOrCreateStarsLevel(familyId, memberId)
    let newBalance = (levelRecord.stars_balance || 0) - amount
    if (newBalance < 0) newBalance = 0

    await pb.collection('stars_levels').update(levelRecord.id, {
      stars_balance: newBalance,
    })

    await pb.collection('stars_transactions').create({
      family_id: familyId,
      member_id: memberId,
      transaction_type: transactionType,
      amount: amount,
      reason: reason,
    })
  } catch (err) {
    throw new Error('Erro ao deduzir estrelas.')
  }
}

export const approveRedemption = async (redemptionId: string, adultMemberId?: string) => {
  try {
    const redemption = await pb
      .collection('rewards_redemptions')
      .getOne(redemptionId, { expand: 'reward_id' })
    if (redemption.status !== 'pending') throw new Error('Este resgate já foi processado.')

    const reward = redemption.expand?.reward_id
    if (!reward) throw new Error('Recompensa não encontrada.')

    await deductStars(
      redemption.family_id,
      redemption.member_id,
      reward.cost,
      `Resgate: ${reward.name}`,
      'spent',
    )

    await pb.collection('rewards_redemptions').update(redemptionId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adultMemberId || null,
    })
  } catch (err: any) {
    throw new Error(err.message || 'Erro ao aprovar o resgate.')
  }
}

export const rejectRedemption = async (redemptionId: string) => {
  try {
    await pb.collection('rewards_redemptions').update(redemptionId, {
      status: 'rejected',
    })
  } catch (err) {
    throw new Error('Erro ao rejeitar o resgate.')
  }
}

export const getStarsHistory = async (memberId: string, page: number = 1, perPage: number = 10) => {
  try {
    return await pb.collection('stars_transactions').getList(page, perPage, {
      filter: `member_id = "${memberId}"`,
      sort: '-created',
    })
  } catch (err) {
    throw new Error('Erro ao buscar o histórico de estrelas.')
  }
}
