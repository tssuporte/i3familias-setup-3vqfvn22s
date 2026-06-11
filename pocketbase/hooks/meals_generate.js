routerAdd(
  'POST',
  '/backend/v1/meals/generate',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    const familyId = body.family_id
    const startDate = body.start_date // Expected YYYY-MM-DD

    if (!familyId) return e.badRequestError('family_id is required')
    if (!startDate) return e.badRequestError('start_date is required')

    const family = $app.findRecordById('families', familyId)
    if (family.getString('user_id') !== userId) return e.forbiddenError('Not your family')

    const pantryItems = $app.findRecordsByFilter(
      'pantry',
      `family_id = '${familyId}' && quantity > 0`,
      'expiry_date',
      50,
      0,
    )

    const inventoryList = pantryItems
      .map((p) => {
        const name = p.getString('name')
        const qty = p.getInt('quantity')
        const unit = p.getString('unit')
        const expiry = p.getString('expiry_date')
        let itemStr = `${name} (${qty} ${unit})`
        if (expiry) {
          itemStr += ` [Vence em: ${expiry.split(' ')[0]}]`
        }
        return itemStr
      })
      .join(', ')

    const inventoryContext = inventoryList
      ? `A família possui os seguintes itens na despensa que devem ser fortemente priorizados, especialmente aqueles próximos da data de vencimento: ${inventoryList}.`
      : `A despensa está vazia no momento. Por favor, baseie as refeições em ingredientes básicos da culinária brasileira, como arroz, feijão, ovos, macarrão, frango, carne moída, legumes e verduras comuns.`

    const prompt = `Por favor, gere o cardápio de 7 dias consecutivos, começando rigorosamente no dia ${startDate}.
${inventoryContext}
Siga TODAS as restrições e regras do seu papel.
A resposta deve ser APENAS o array JSON puro e válido, sem nenhum texto introdutório e SEM blocos de código Markdown (não use \`\`\`json).`

    const result = $ai.agent('meal-planner').chat({
      user_id: userId,
      message: prompt,
    })

    let mealsArray = []
    try {
      let jsonStr = result.content.trim()
      const match = jsonStr.match(/\[[\s\S]*\]/)
      if (match) {
        jsonStr = match[0]
      }
      mealsArray = JSON.parse(jsonStr)
    } catch (err) {
      return e.badRequestError(
        'Falha ao analisar a resposta da inteligência artificial. Formato de JSON inválido retornado.',
      )
    }

    const mealsCol = $app.findCollectionByNameOrId('meals')
    const createdMeals = []

    $app.runInTransaction((txApp) => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + 6)
      const endDate = d.toISOString().split('T')[0]

      const existing = txApp.findRecordsByFilter(
        'meals',
        `family_id = '${familyId}' && date >= '${startDate} 00:00:00' && date <= '${endDate} 23:59:59'`,
        '-created',
        100,
        0,
      )
      for (const rec of existing) {
        txApp.delete(rec)
      }

      for (const item of mealsArray) {
        const record = new Record(mealsCol)
        record.set('family_id', familyId)
        record.set('date', item.date + ' 12:00:00.000Z')
        record.set('meal_type', item.meal_type || 'lunch')
        record.set('dish', item.dish || 'Refeição Sugerida')
        record.set('ingredients', item.ingredients || [])
        record.set('prep_time', item.prep_time || 30)
        record.set('difficulty', item.difficulty || 'medium')
        record.set('is_cooked', false)
        txApp.save(record)

        const exported = {
          id: record.id,
          dish: record.getString('dish'),
        }
        createdMeals.push(exported)
      }

      const notif = new Record(txApp.findCollectionByNameOrId('notifications'))
      notif.set('family_id', familyId)
      notif.set('user_id', family.getString('user_id'))
      notif.set('type', 'system')
      notif.set('title', 'Cardápio Gerado')
      notif.set('message', 'Cardápio gerado usando itens da despensa')
      txApp.save(notif)

      const audit = new Record(txApp.findCollectionByNameOrId('audit_log'))
      audit.set('family_id', familyId)
      audit.set('event_type', 'flow_meal_planning')
      audit.set('description', 'Generated meals using pantry inventory')
      txApp.save(audit)
    })

    return e.json(200, { success: true, meals: createdMeals })
  },
  $apis.requireAuth(),
)
