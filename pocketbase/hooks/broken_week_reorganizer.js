routerAdd(
  'POST',
  '/backend/v1/reorganize-week',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    const familyId = body.family_id
    if (!familyId) return e.badRequestError('family_id required')

    const family = $app.findRecordById('families', familyId)
    if (family.getString('user_id') !== userId) return e.forbiddenError('not your family')

    const tasksC = $app.findRecordsByFilter(
      'tasks_children',
      `family_id = '${familyId}' && status = 'pending'`,
      '',
      20,
      0,
    )
    const tasksA = $app.findRecordsByFilter(
      'tasks_adults',
      `family_id = '${familyId}' && status = 'pending'`,
      '',
      20,
      0,
    )
    const meals = $app.findRecordsByFilter(
      'meals',
      `family_id = '${familyId}' && is_cooked = false`,
      '',
      20,
      0,
    )
    const events = $app.findRecordsByFilter(
      'calendar_events',
      `family_id = '${familyId}'`,
      '-created',
      20,
      0,
    )

    const contextData = {
      tasks_children: tasksC.map((t) => ({ id: t.id, name: t.getString('name') })),
      tasks_adults: tasksA.map((t) => ({ id: t.id, name: t.getString('name') })),
      meals: meals.map((m) => ({ id: m.id, dish: m.getString('dish'), date: m.getString('date') })),
      events: events.map((ev) => ({ title: ev.getString('title'), date: ev.getString('date') })),
    }

    const prompt = `A família teve uma 'quebra de rotina'. Reorganize as tarefas e refeições para acomodar os eventos pendentes.
Aqui estão os dados atuais em JSON: ${JSON.stringify(contextData)}
Por favor, retorne um JSON com a mesma estrutura para 'tasks_children', 'tasks_adults', e 'meals' contendo os novos horários ou datas (apenas retorne o JSON com chaves "tasks_children" (array de {id, due_date}), "tasks_adults", "meals"). Não mude os IDs.`

    let attempt = 0
    let success = false
    let parsed = null

    while (attempt < 3 && !success) {
      try {
        const res = $ai.chat({
          model: 'reasoning',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente JSON. Retorne APENAS um JSON válido.',
            },
            { role: 'user', content: prompt },
          ],
        })

        let text = res.choices[0].message.content
        const match = text.match(/\{[\s\S]*\}/)
        if (match) text = match[0]

        parsed = JSON.parse(text)
        success = true
      } catch (err) {
        attempt++
      }
    }

    if (!success || !parsed) {
      const errLog = new Record($app.findCollectionByNameOrId('error_log'))
      errLog.set('family_id', familyId)
      errLog.set('flow_name', 'broken_week_reorganizer')
      errLog.set('error_message', 'Failed to parse AI response after 3 attempts')
      $app.save(errLog)

      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('family_id', familyId)
      notif.set('user_id', family.getString('user_id'))
      notif.set('type', 'system')
      notif.set('title', 'Erro de Reorganização')
      notif.set('message', 'Falha ao reorganizar a semana. Verifique os logs.')
      $app.save(notif)

      return e.internalServerError('Falha ao reorganizar a semana.')
    }

    try {
      $app.runInTransaction((tx) => {
        if (parsed.tasks_children) {
          for (const t of parsed.tasks_children) {
            if (t.id && t.due_date) {
              const rec = tx.findRecordById('tasks_children', t.id)
              rec.set('due_date', t.due_date.split('T')[0] + ' 12:00:00.000Z')
              tx.save(rec)
            }
          }
        }
        if (parsed.tasks_adults) {
          for (const t of parsed.tasks_adults) {
            if (t.id && t.due_date) {
              const rec = tx.findRecordById('tasks_adults', t.id)
              rec.set('due_date', t.due_date.split('T')[0] + ' 12:00:00.000Z')
              tx.save(rec)
            }
          }
        }
        if (parsed.meals) {
          for (const m of parsed.meals) {
            if (m.id && m.date) {
              const rec = tx.findRecordById('meals', m.id)
              rec.set('date', m.date.split('T')[0] + ' 12:00:00.000Z')
              tx.save(rec)
            }
          }
        }
      })

      const audit = new Record($app.findCollectionByNameOrId('audit_log'))
      audit.set('family_id', familyId)
      audit.set('event_type', 'flow_broken_week')
      audit.set('description', 'Week reorganized via AI')
      $app.save(audit)

      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('family_id', familyId)
      notif.set('user_id', family.getString('user_id'))
      notif.set('type', 'system')
      notif.set('title', 'Reorganização')
      notif.set('message', 'Semana reorganizada com sucesso!')
      $app.save(notif)
    } catch (err) {
      const errLog = new Record($app.findCollectionByNameOrId('error_log'))
      errLog.set('family_id', familyId)
      errLog.set('flow_name', 'broken_week_reorganizer')
      errLog.set('error_message', err.message)
      $app.save(errLog)
      return e.internalServerError('Falha ao salvar as modificações.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
