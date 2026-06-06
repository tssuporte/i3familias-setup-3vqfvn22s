migrate(
  (app) => {
    const families = new Collection({
      name: 'families',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: 'user_id = @request.auth.id',
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'timezone', type: 'text' },
        { name: 'currency', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_families_user_id ON families (user_id)'],
    })
    app.save(families)

    const family_members = new Collection({
      name: 'family_members',
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
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'birth_date', type: 'date', required: true },
        { name: 'photo_url', type: 'text' },
        {
          name: 'member_type',
          type: 'select',
          values: ['child', 'adult'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'education_type',
          type: 'select',
          values: ['traditional', 'homeschooling'],
          maxSelect: 1,
        },
        { name: 'dietary_restrictions', type: 'text' },
        { name: 'pin_code', type: 'text', pattern: '^\\d{4}$' },
        { name: 'role', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_family_members_family_id ON family_members (family_id)'],
    })
    app.save(family_members)
  },
  (app) => {
    try {
      const family_members = app.findCollectionByNameOrId('family_members')
      app.delete(family_members)
    } catch (e) {}
    try {
      const families = app.findCollectionByNameOrId('families')
      app.delete(families)
    } catch (e) {}
  },
)
