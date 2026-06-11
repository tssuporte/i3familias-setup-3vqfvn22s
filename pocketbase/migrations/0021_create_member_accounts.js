migrate(
  (app) => {
    const collection = new Collection({
      name: 'member_accounts',
      type: 'auth',
      listRule: 'family_id.user_id = @request.auth.id',
      viewRule: 'family_id.user_id = @request.auth.id || id = @request.auth.id',
      createRule: 'family_id.user_id = @request.auth.id',
      updateRule: 'family_id.user_id = @request.auth.id || id = @request.auth.id',
      deleteRule: 'family_id.user_id = @request.auth.id',
      manageRule: 'family_id.user_id = @request.auth.id',
      fields: [
        {
          name: 'family_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('families').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('family_members').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['child', 'adult', 'admin'],
          maxSelect: 1,
        },
      ],
      indexes: [],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('member_accounts')
    app.delete(collection)
  },
)
