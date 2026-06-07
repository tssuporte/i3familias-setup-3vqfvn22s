onRecordAfterUpdateSuccess((e) => {
  try {
    const familyId = e.record.getString('family_id')
    const qty = e.record.getInt('quantity')
    const minStock = e.record.getInt('min_stock')
    const oldQty = e.record.original().getInt('quantity')

    if (qty < minStock && oldQty >= minStock) {
      const name = e.record.getString('name')
      const unit = e.record.getString('unit')
      const category = e.record.getString('category') || 'Pantry'

      const needed = minStock - qty

      try {
        const existing = $app.findFirstRecordByFilter(
          'shopping_items',
          `family_id = '${familyId}' && name = '${name.replace(/'/g, "''")}' && is_purchased = false`,
        )
        existing.set('quantity', existing.getInt('quantity') + needed)
        $app.save(existing)
      } catch (err) {
        const item = new Record($app.findCollectionByNameOrId('shopping_items'))
        item.set('family_id', familyId)
        item.set('name', name)
        item.set('quantity', needed)
        item.set('unit', unit)
        item.set('category', category)
        item.set('is_purchased', false)
        item.set('source', 'auto-generated')
        $app.save(item)
      }

      const family = $app.findRecordById('families', familyId)
      const notif = new Record($app.findCollectionByNameOrId('notifications'))
      notif.set('family_id', familyId)
      notif.set('user_id', family.getString('user_id'))
      notif.set('type', 'pantry')
      notif.set('title', 'Alerta de Despensa')
      notif.set('message', `Item ${name} adicionado à lista de compras`)
      $app.save(notif)

      const audit = new Record($app.findCollectionByNameOrId('audit_log'))
      audit.set('family_id', familyId)
      audit.set('event_type', 'flow_pantry_shopping')
      audit.set('description', `Added ${needed} ${unit} of ${name} to shopping list.`)
      $app.save(audit)
    }
  } catch (err) {
    try {
      const errLog = new Record($app.findCollectionByNameOrId('error_log'))
      errLog.set('family_id', e.record.getString('family_id'))
      errLog.set('flow_name', 'flow_pantry_to_shopping')
      errLog.set('error_message', err.message)
      $app.save(errLog)
    } catch (e2) {}
  }
  return e.next()
}, 'pantry')
