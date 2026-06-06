migrate(
  (app) => {
    const starsLevels = new Collection({
      name: 'stars_levels',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: 'family_id.user_id = @request.auth.id',
      updateRule: 'family_id.user_id = @request.auth.id',
      deleteRule: 'family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          maxSelect: 1,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('family_members').id,
          maxSelect: 1,
        },
        { name: 'stars_total_earned', type: 'number', required: false },
        { name: 'stars_balance', type: 'number', required: false },
        { name: 'current_level', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_stars_levels_member ON stars_levels (member_id)'],
    })
    app.save(starsLevels)

    const starsTransactions = new Collection({
      name: 'stars_transactions',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: 'family_id.user_id = @request.auth.id',
      updateRule: 'family_id.user_id = @request.auth.id',
      deleteRule: 'family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          maxSelect: 1,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('family_members').id,
          maxSelect: 1,
        },
        {
          name: 'transaction_type',
          type: 'select',
          required: true,
          values: ['earned', 'spent', 'penalty'],
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true },
        { name: 'reason', type: 'text', required: true },
        {
          name: 'related_task_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('tasks_children').id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(starsTransactions)

    const rewards = new Collection({
      name: 'rewards',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: 'family_id.user_id = @request.auth.id',
      updateRule: 'family_id.user_id = @request.auth.id',
      deleteRule: 'family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'cost', type: 'number', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'image_url', type: 'text', required: false },
        { name: 'category', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(rewards)

    const rewardsRedemptions = new Collection({
      name: 'rewards_redemptions',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: 'family_id.user_id = @request.auth.id',
      updateRule: 'family_id.user_id = @request.auth.id',
      deleteRule: 'family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          maxSelect: 1,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('family_members').id,
          maxSelect: 1,
        },
        {
          name: 'reward_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('rewards').id,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'approved', 'rejected'],
          maxSelect: 1,
        },
        { name: 'requested_at', type: 'date', required: true },
        { name: 'approved_at', type: 'date', required: false },
        {
          name: 'approved_by',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('family_members').id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(rewardsRedemptions)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('rewards_redemptions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('rewards'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('stars_transactions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('stars_levels'))
    } catch (_) {}
  },
)
