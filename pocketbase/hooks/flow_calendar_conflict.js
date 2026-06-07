function checkConflict(e) {
  const status = e.record.getString('status')
  const oldStatus = e.record.original().getString('status')

  if (status === 'completed' && oldStatus !== 'completed') {
    const familyId = e.record.getString('family_id')
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    try {
      const events = $app.findRecordsByFilter(
        'calendar_events',
        `family_id = '${familyId}' && date >= '${today} 00:00:00' && date <= '${today} 23:59:59'`,
        '-created',
        100,
        0,
      )

      for (const ev of events) {
        const time = ev.getString('time')
        if (!time) {
          throw new BadRequestError(`Tarefa bloqueada durante ${ev.getString('title')}`)
        } else {
          const evHour = parseInt(time.split(':')[0])
          if (Math.abs(now.getHours() - evHour) <= 1) {
            throw new BadRequestError(`Tarefa bloqueada durante ${ev.getString('title')}`)
          }
        }
      }
    } catch (err) {
      if (err instanceof BadRequestError) throw err
    }
  }
}

onRecordUpdateRequest(
  (e) => {
    checkConflict(e)
    return e.next()
  },
  'tasks_children',
  'tasks_adults',
)
