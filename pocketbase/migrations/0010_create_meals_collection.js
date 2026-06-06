migrate(
  (app) => {
    const collection = new Collection({
      name: 'meals',
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
        { name: 'date', type: 'date', required: true },
        {
          name: 'meal_type',
          type: 'select',
          required: true,
          values: ['breakfast', 'lunch', 'dinner'],
          maxSelect: 1,
        },
        { name: 'dish', type: 'text', required: true },
        { name: 'ingredients', type: 'json' },
        { name: 'prep_time', type: 'number', min: 1 },
        { name: 'difficulty', type: 'select', values: ['easy', 'medium', 'hard'], maxSelect: 1 },
        { name: 'family_rating', type: 'number', min: 1, max: 5 },
        { name: 'is_cooked', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_meals_family_date ON meals (family_id, date)',
        'CREATE INDEX idx_meals_type ON meals (meal_type)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('meals')
    app.delete(collection)
  },
)
