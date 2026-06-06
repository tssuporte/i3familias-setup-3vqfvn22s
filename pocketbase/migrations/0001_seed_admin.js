migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'silas@gtrin.com.br')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('silas@gtrin.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'silas@gtrin.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
