migrate(
  (app) => {
    const families = app.findCollectionByNameOrId('families')
    families.listRule = 'user_id = @request.auth.id || id = @request.auth.family_id'
    families.viewRule = 'user_id = @request.auth.id || id = @request.auth.family_id'
    app.save(families)

    const collectionsToUpdate = [
      'family_members',
      'family_notices',
      'tasks_children',
      'tasks_adults',
      'stars_levels',
      'stars_transactions',
      'rewards',
      'rewards_redemptions',
      'pantry',
      'meals',
      'shopping_items',
      'calendar_events',
      'finance_accounts',
      'finance_transactions',
    ]

    const newRule =
      "family_id.user_id = @request.auth.id || (@request.auth.collectionName = 'member_accounts' && family_id = @request.auth.family_id)"

    for (const name of collectionsToUpdate) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.listRule = newRule
        col.viewRule = newRule
        col.createRule = newRule
        col.updateRule = newRule
        col.deleteRule = newRule
        app.save(col)
      } catch (err) {
        console.log('Could not update ' + name + ': ' + err.message)
      }
    }
  },
  (app) => {
    const families = app.findCollectionByNameOrId('families')
    families.listRule = 'user_id = @request.auth.id'
    families.viewRule = 'user_id = @request.auth.id'
    app.save(families)

    const collectionsToUpdate = [
      'family_members',
      'family_notices',
      'tasks_children',
      'tasks_adults',
      'stars_levels',
      'stars_transactions',
      'rewards',
      'rewards_redemptions',
      'pantry',
      'meals',
      'shopping_items',
      'calendar_events',
      'finance_accounts',
      'finance_transactions',
    ]

    const oldRule = 'family_id.user_id = @request.auth.id'

    for (const name of collectionsToUpdate) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.listRule = oldRule
        col.viewRule = oldRule
        col.createRule = oldRule
        col.updateRule = oldRule
        col.deleteRule = oldRule
        app.save(col)
      } catch (err) {
        console.log('Could not revert ' + name + ': ' + err.message)
      }
    }
  },
)
