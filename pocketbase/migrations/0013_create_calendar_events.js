migrate(
  (app) => {
    const familyCol = app.findCollectionByNameOrId('families')
    const memberCol = app.findCollectionByNameOrId('family_members')

    const collection = new Collection({
      name: 'calendar_events',
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
          collectionId: familyCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['school', 'family', 'task', 'holiday'],
          maxSelect: 1,
        },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'text' },
        {
          name: 'attendees',
          type: 'relation',
          collectionId: memberCol.id,
          cascadeDelete: false,
          maxSelect: 100,
        },
        { name: 'description', type: 'text' },
        {
          name: 'recurrence',
          type: 'select',
          values: ['none', 'daily', 'weekly', 'monthly'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_calendar_events_family_date ON calendar_events (family_id, date)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('calendar_events')
    app.delete(collection)
  },
)
