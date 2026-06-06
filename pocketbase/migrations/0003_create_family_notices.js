migrate(
  (app) => {
    const collection = new Collection({
      name: 'family_notices',
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
        { name: 'content', type: 'text', required: true },
        { name: 'author_name', type: 'text', required: true },
        { name: 'status', type: 'select', required: true, values: ['active', 'inactive'] },
        { name: 'expiry_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notices_family ON family_notices (family_id)',
        'CREATE INDEX idx_notices_status ON family_notices (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('family_notices'))
  },
)
