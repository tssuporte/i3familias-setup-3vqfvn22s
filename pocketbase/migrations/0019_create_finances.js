migrate(
  (app) => {
    const families = app.findCollectionByNameOrId('families')
    const familyMembers = app.findCollectionByNameOrId('family_members')

    const accounts = new Collection({
      name: 'finance_accounts',
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
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['checking', 'savings', 'credit', 'cash'],
          maxSelect: 1,
        },
        { name: 'balance', type: 'number', required: false },
        { name: 'currency', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_finance_accounts_family ON finance_accounts (family_id)'],
    })
    app.save(accounts)

    const transactions = new Collection({
      name: 'finance_transactions',
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
          cascadeDelete: true,
        },
        {
          name: 'account_id',
          type: 'relation',
          required: true,
          collectionId: accounts.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['income', 'expense'],
          maxSelect: 1,
        },
        { name: 'category', type: 'text', required: false },
        { name: 'description', type: 'text', required: false },
        { name: 'date', type: 'date', required: true },
        {
          name: 'created_by',
          type: 'relation',
          required: false,
          collectionId: familyMembers.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_finance_txs_family ON finance_transactions (family_id)',
        'CREATE INDEX idx_finance_txs_account ON finance_transactions (account_id)',
        'CREATE INDEX idx_finance_txs_date ON finance_transactions (date)',
      ],
    })
    app.save(transactions)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('finance_transactions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('finance_accounts'))
    } catch (_) {}
  },
)
