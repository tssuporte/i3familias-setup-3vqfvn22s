migrate(
  (app) => {
    const calendarCol = app.findCollectionByNameOrId('calendar_events')
    if (!calendarCol.fields.getByName('subtype')) {
      calendarCol.fields.add(new TextField({ name: 'subtype' }))
      app.save(calendarCol)
    }

    const tasksChildrenCol = app.findCollectionByNameOrId('tasks_children')
    if (!tasksChildrenCol.fields.getByName('due_date')) {
      tasksChildrenCol.fields.add(new DateField({ name: 'due_date' }))
      app.save(tasksChildrenCol)
    }

    const familiesCol = app.findCollectionByNameOrId('families')

    const auditLogCol = new Collection({
      name: 'audit_log',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: familiesCol.id,
          maxSelect: 1,
        },
        { name: 'event_type', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(auditLogCol)

    const errorLogCol = new Collection({
      name: 'error_log',
      type: 'base',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: familiesCol.id,
          maxSelect: 1,
        },
        { name: 'flow_name', type: 'text', required: true },
        { name: 'error_message', type: 'text', required: true },
        { name: 'stack_trace', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(errorLogCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_log'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('error_log'))
    } catch (e) {}
    try {
      const calendarCol = app.findCollectionByNameOrId('calendar_events')
      calendarCol.fields.removeByName('subtype')
      app.save(calendarCol)
    } catch (e) {}
    try {
      const tasksChildrenCol = app.findCollectionByNameOrId('tasks_children')
      tasksChildrenCol.fields.removeByName('due_date')
      app.save(tasksChildrenCol)
    } catch (e) {}
  },
)
