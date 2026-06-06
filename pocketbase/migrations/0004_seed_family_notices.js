migrate(
  (app) => {
    try {
      const family = app.findFirstRecordByFilter('families', '')
      if (family) {
        const collection = app.findCollectionByNameOrId('family_notices')

        const notice1 = new Record(collection)
        notice1.set('family_id', family.id)
        notice1.set('content', 'Lembrar de comprar ração para o cachorro hoje à tarde!')
        notice1.set('author_name', 'Mãe')
        notice1.set('status', 'active')
        app.save(notice1)

        const notice2 = new Record(collection)
        notice2.set('family_id', family.id)
        notice2.set('content', 'Amanhã não tem aula, aproveitem o feriado em família!')
        notice2.set('author_name', 'Pai')
        notice2.set('status', 'active')
        app.save(notice2)
      }
    } catch (_) {
      // Skip if no families exist yet
    }
  },
  (app) => {
    try {
      const notices = app.findRecordsByFilter(
        'family_notices',
        "content ~ 'Lembrar de comprar'",
        '',
        10,
        0,
      )
      for (const n of notices) {
        app.delete(n)
      }
    } catch (_) {}
  },
)
