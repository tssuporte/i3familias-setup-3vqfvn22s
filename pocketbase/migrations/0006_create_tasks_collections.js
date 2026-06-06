migrate(
  (app) => {
    const families = app.findCollectionByNameOrId('families')
    const familyMembers = app.findCollectionByNameOrId('family_members')

    const tasksChildren = new Collection({
      name: 'tasks_children',
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
          collectionId: families.id,
          maxSelect: 1,
        },
        {
          name: 'assigned_to',
          type: 'relation',
          required: true,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'recurrence', type: 'select', values: ['once', 'daily', 'weekly', 'custom'] },
        { name: 'due_time', type: 'text' },
        { name: 'estimated_minutes', type: 'number' },
        { name: 'stars_value', type: 'number' },
        { name: 'penalty_stars', type: 'number' },
        { name: 'requires_photo', type: 'bool' },
        { name: 'status', type: 'select', values: ['pending', 'completed', 'overdue'] },
        { name: 'completed_at', type: 'date' },
        { name: 'photo_url', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tasksChildren)

    const tasksAdults = new Collection({
      name: 'tasks_adults',
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
          collectionId: families.id,
          maxSelect: 1,
        },
        {
          name: 'assigned_to',
          type: 'relation',
          required: true,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        {
          name: 'created_by',
          type: 'relation',
          required: false,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'due_time', type: 'text' },
        { name: 'recurrence', type: 'select', values: ['once', 'daily', 'weekly', 'custom'] },
        { name: 'priority', type: 'select', values: ['low', 'medium', 'high'] },
        { name: 'reminder_time', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'select', values: ['pending', 'completed', 'overdue'] },
        { name: 'completed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tasksAdults)

    const weekLeader = new Collection({
      name: 'week_leader',
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
          collectionId: families.id,
          maxSelect: 1,
        },
        { name: 'week_start_date', type: 'date', required: true },
        {
          name: 'leader_id',
          type: 'relation',
          required: true,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        { name: 'bonus_stars', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(weekLeader)

    const weekLeaderConf = new Collection({
      name: 'week_leader_confirmations',
      type: 'base',
      listRule: 'week_leader_id.family_id.user_id = @request.auth.id',
      viewRule: 'week_leader_id.family_id.user_id = @request.auth.id',
      createRule: 'week_leader_id.family_id.user_id = @request.auth.id',
      updateRule: 'week_leader_id.family_id.user_id = @request.auth.id',
      deleteRule: 'week_leader_id.family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'week_leader_id',
          type: 'relation',
          required: true,
          collectionId: weekLeader.id,
          maxSelect: 1,
        },
        {
          name: 'sibling_id',
          type: 'relation',
          required: true,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        {
          name: 'task_id',
          type: 'relation',
          required: true,
          collectionId: tasksChildren.id,
          maxSelect: 1,
        },
        { name: 'confirmed', type: 'bool' },
        { name: 'confirmed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(weekLeaderConf)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('week_leader_confirmations'))
    } catch {}
    try {
      app.delete(app.findCollectionByNameOrId('week_leader'))
    } catch {}
    try {
      app.delete(app.findCollectionByNameOrId('tasks_adults'))
    } catch {}
    try {
      app.delete(app.findCollectionByNameOrId('tasks_children'))
    } catch {}
  },
)
