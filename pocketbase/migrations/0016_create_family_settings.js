migrate(
  (app) => {
    const collection = new Collection({
      name: 'family_settings',
      type: 'base',
      listRule: "@request.auth.id != '' && family_id.user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && family_id.user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && family_id.user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && family_id.user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && family_id.user_id = @request.auth.id",
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'setting_key', type: 'text', required: true },
        { name: 'setting_value', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_family_settings_key ON family_settings (family_id, setting_key)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('family_settings')
    app.delete(collection)
  },
)
