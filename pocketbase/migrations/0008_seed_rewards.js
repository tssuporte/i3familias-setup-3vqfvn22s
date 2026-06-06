migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'silas@gtrin.com.br')
      const families = app.findRecordsByFilter('families', `user_id = '${user.id}'`, '', 1, 0)
      if (families.length === 0) return

      const myFamily = families[0]
      const rewards = app.findCollectionByNameOrId('rewards')

      // Check if rewards already exist for this family
      const existing = app.findRecordsByFilter('rewards', `family_id = '${myFamily.id}'`, '', 1, 0)
      if (existing.length > 0) return

      const r1 = new Record(rewards)
      r1.set('family_id', myFamily.id)
      r1.set('name', 'Ir ao Cinema')
      r1.set('cost', 50)
      r1.set('description', 'Vale um ingresso para o cinema no final de semana.')
      r1.set('image_url', 'https://img.usecurling.com/p/400/300?q=cinema&color=blue')
      r1.set('category', 'Passeios')
      app.save(r1)

      const r2 = new Record(rewards)
      r2.set('family_id', myFamily.id)
      r2.set('name', 'Hora extra de videogame')
      r2.set('cost', 30)
      r2.set('description', 'Vale 1 hora a mais para jogar videogame.')
      r2.set('image_url', 'https://img.usecurling.com/p/400/300?q=videogame&color=purple')
      r2.set('category', 'Eletrônicos')
      app.save(r2)

      const r3 = new Record(rewards)
      r3.set('family_id', myFamily.id)
      r3.set('name', 'Escolher o Jantar')
      r3.set('cost', 40)
      r3.set('description', 'Direito a escolher o cardápio do jantar de sexta-feira.')
      r3.set('image_url', 'https://img.usecurling.com/p/400/300?q=pizza&color=orange')
      r3.set('category', 'Alimentação')
      app.save(r3)
    } catch (_) {}
  },
  (app) => {
    // down
  },
)
