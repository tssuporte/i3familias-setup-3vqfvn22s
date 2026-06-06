migrate(
  (app) => {
    const collection = new Collection({
      name: 'shopping_items',
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
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, min: 0 },
        { name: 'unit', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'estimated_price', type: 'number' },
        { name: 'is_purchased', type: 'bool' },
        { name: 'source', type: 'select', values: ['manual', 'auto-generated'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_shopping_items_family ON shopping_items (family_id)'],
    })
    app.save(collection)

    const families = app.findCollectionByNameOrId('families')
    if (!families.fields.getByName('shopping_budget')) {
      families.fields.add(new NumberField({ name: 'shopping_budget', min: 0 }))
      app.save(families)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('shopping_items')
    app.delete(collection)

    const families = app.findCollectionByNameOrId('families')
    families.fields.removeByName('shopping_budget')
    app.save(families)
  },
)
