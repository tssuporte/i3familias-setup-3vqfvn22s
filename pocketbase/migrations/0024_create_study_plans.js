migrate(
  (app) => {
    const familiesId = app.findCollectionByNameOrId('families').id
    const familyMembersId = app.findCollectionByNameOrId('family_members').id

    const studyPlans = new Collection({
      name: 'study_plans',
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
          maxSelect: 1,
          collectionId: familiesId,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: familyMembersId,
        },
        { name: 'year', type: 'number', required: true },
        { name: 'grade_label', type: 'text' },
        { name: 'bncc_topics', type: 'json' },
        { name: 'custom_topics', type: 'json' },
        { name: 'parent_notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_study_plans_member_year ON study_plans (member_id, year)'],
    })
    app.save(studyPlans)

    const studySessions = new Collection({
      name: 'study_sessions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'study_plan_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: studyPlans.id,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: familyMembersId,
        },
        { name: 'topic_id', type: 'text' },
        { name: 'topic_label', type: 'text' },
        { name: 'conversation_id', type: 'text' },
        { name: 'duration_minutes', type: 'number' },
        { name: 'tutor_evaluation', type: 'json' },
        {
          name: 'status',
          type: 'select',
          maxSelect: 1,
          values: ['in_progress', 'completed', 'needs_review'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(studySessions)

    const topicProgress = new Collection({
      name: 'topic_progress',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'study_plan_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: studyPlans.id,
        },
        {
          name: 'member_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: familyMembersId,
        },
        { name: 'topic_id', type: 'text', required: true },
        { name: 'topic_label', type: 'text' },
        { name: 'mastery_level', type: 'number' },
        { name: 'sessions_count', type: 'number' },
        { name: 'last_session_at', type: 'date' },
        { name: 'parent_override_note', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_topic_progress_plan_topic ON topic_progress (study_plan_id, topic_id)',
      ],
    })
    app.save(topicProgress)
  },
  (app) => {
    try {
      const topicProgress = app.findCollectionByNameOrId('topic_progress')
      app.delete(topicProgress)
    } catch (_) {}

    try {
      const studySessions = app.findCollectionByNameOrId('study_sessions')
      app.delete(studySessions)
    } catch (_) {}

    try {
      const studyPlans = app.findCollectionByNameOrId('study_plans')
      app.delete(studyPlans)
    } catch (_) {}
  },
)
