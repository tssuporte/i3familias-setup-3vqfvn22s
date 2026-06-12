migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('family_members')

    if (!col.fields.getByName('school_year')) {
      col.fields.add(
        new SelectField({
          name: 'school_year',
          maxSelect: 1,
          values: [
            'pre',
            'ef1',
            'ef2',
            'ef3',
            'ef4',
            'ef5',
            'ef6',
            'ef7',
            'ef8',
            'ef9',
            'em1',
            'em2',
            'em3',
          ],
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('family_members')
    if (col.fields.getByName('school_year')) {
      col.fields.removeByName('school_year')
      app.save(col)
    }
  },
)
