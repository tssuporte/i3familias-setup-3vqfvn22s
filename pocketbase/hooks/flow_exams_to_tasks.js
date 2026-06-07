onRecordAfterCreateSuccess((e) => {
  try {
    if (e.record.getString('type') === 'school' && e.record.getString('subtype') === 'exam') {
      const familyId = e.record.getString('family_id')
      const attendees = e.record.get('attendees') || []
      const eventDate = e.record.getString('date')

      const due = new Date(eventDate)
      due.setDate(due.getDate() - 2)
      const dueStr = due.toISOString().split('T')[0] + ' 12:00:00.000Z'

      for (const memberId of attendees) {
        try {
          const member = $app.findRecordById('family_members', memberId)
          if (member.getString('member_type') === 'child') {
            const task = new Record($app.findCollectionByNameOrId('tasks_children'))
            task.set('family_id', familyId)
            task.set('assigned_to', memberId)
            task.set('name', 'Estudar para ' + e.record.getString('title'))
            task.set('recurrence', 'daily')
            task.set('due_date', dueStr)
            task.set('stars_value', 10)
            task.set('status', 'pending')

            $app.save(task)

            const family = $app.findRecordById('families', familyId)
            const notif = new Record($app.findCollectionByNameOrId('notifications'))
            notif.set('family_id', familyId)
            notif.set('user_id', family.getString('user_id'))
            notif.set('type', 'study')
            notif.set('title', 'Nova Tarefa')
            notif.set(
              'message',
              'Nova tarefa de estudo criada: Estudar para ' + e.record.getString('title'),
            )
            $app.save(notif)

            const audit = new Record($app.findCollectionByNameOrId('audit_log'))
            audit.set('family_id', familyId)
            audit.set('event_type', 'flow_exam_task')
            audit.set('description', 'Created study task for ' + e.record.getString('title'))
            $app.save(audit)
          }
        } catch (err) {
          const errLog = new Record($app.findCollectionByNameOrId('error_log'))
          errLog.set('family_id', familyId)
          errLog.set('flow_name', 'flow_exams_to_tasks')
          errLog.set('error_message', err.message)
          $app.save(errLog)
        }
      }
    }
  } catch (err) {}
  return e.next()
}, 'calendar_events')
