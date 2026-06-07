function handleRedemption(e) {
  if (e.record.getString('status') === 'pending') {
    const isUpdate = typeof e.record.original === 'function'
    if (isUpdate && e.record.original().getString('status') === 'pending') {
      return
    }

    const familyId = e.record.getString('family_id')
    const memberId = e.record.getString('member_id')
    const rewardId = e.record.getString('reward_id')

    try {
      const reward = $app.findRecordById('rewards', rewardId)
      const cost = reward.getInt('cost')
      const rewardName = reward.getString('name')

      const levels = $app.findRecordsByFilter('stars_levels', `member_id = '${memberId}'`, '', 1, 0)
      if (levels.length > 0) {
        const level = levels[0]
        const balance = level.getInt('stars_balance')
        const family = $app.findRecordById('families', familyId)

        $app.runInTransaction((tx) => {
          if (balance >= cost) {
            level.set('stars_balance', balance - cost)
            tx.save(level)

            const txRecord = new Record(tx.findCollectionByNameOrId('stars_transactions'))
            txRecord.set('family_id', familyId)
            txRecord.set('member_id', memberId)
            txRecord.set('transaction_type', 'spent')
            txRecord.set('amount', cost)
            txRecord.set('reason', 'Resgate: ' + rewardName)
            tx.save(txRecord)

            e.record.set('status', 'approved')
            e.record.set('approved_at', new Date().toISOString())
            tx.save(e.record)

            const notif = new Record(tx.findCollectionByNameOrId('notifications'))
            notif.set('family_id', familyId)
            notif.set('user_id', family.getString('user_id'))
            notif.set('type', 'star')
            notif.set('title', 'Resgate Aprovado')
            notif.set('message', `Recompensa ${rewardName} resgatada! -${cost} estrelas`)
            tx.save(notif)

            const audit = new Record(tx.findCollectionByNameOrId('audit_log'))
            audit.set('family_id', familyId)
            audit.set('event_type', 'flow_reward_redemption')
            audit.set('description', `Approved redemption for ${rewardName}`)
            tx.save(audit)
          } else {
            e.record.set('status', 'rejected')
            tx.save(e.record)

            const notif = new Record(tx.findCollectionByNameOrId('notifications'))
            notif.set('family_id', familyId)
            notif.set('user_id', family.getString('user_id'))
            notif.set('type', 'system')
            notif.set('title', 'Resgate Rejeitado')
            notif.set('message', `Estrelas insuficientes para ${rewardName}`)
            tx.save(notif)

            const audit = new Record(tx.findCollectionByNameOrId('audit_log'))
            audit.set('family_id', familyId)
            audit.set('event_type', 'flow_reward_redemption')
            audit.set('description', `Rejected redemption for ${rewardName}`)
            tx.save(audit)
          }
        })
      }
    } catch (err) {
      const errLog = new Record($app.findCollectionByNameOrId('error_log'))
      errLog.set('family_id', familyId)
      errLog.set('flow_name', 'flow_rewards')
      errLog.set('error_message', err.message)
      $app.save(errLog)
    }
  }
}

onRecordAfterCreateSuccess((e) => {
  handleRedemption(e)
  return e.next()
}, 'rewards_redemptions')

onRecordAfterUpdateSuccess((e) => {
  handleRedemption(e)
  return e.next()
}, 'rewards_redemptions')
