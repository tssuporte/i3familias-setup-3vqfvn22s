routerAdd(
  'POST',
  '/backend/v1/study-sessions/save-evaluation',
  (e) => {
    const body = e.requestInfo().body || {}
    const { study_plan_id, member_id, topic_id, topic_label, evaluation } = body

    if (!study_plan_id || !member_id || !topic_id) {
      return e.badRequestError('Missing required fields')
    }

    let progressRecord
    try {
      progressRecord = $app.findFirstRecordByFilter(
        'topic_progress',
        'study_plan_id = {:study_plan_id} && topic_id = {:topic_id}',
        { study_plan_id, topic_id },
      )
    } catch (_) {
      const col = $app.findCollectionByNameOrId('topic_progress')
      progressRecord = new Record(col)
      progressRecord.set('study_plan_id', study_plan_id)
      progressRecord.set('member_id', member_id)
      progressRecord.set('topic_id', topic_id)
      progressRecord.set('topic_label', topic_label)
      progressRecord.set('mastery_level', 1)
      progressRecord.set('sessions_count', 0)
    }

    const currentCount = progressRecord.getInt('sessions_count') || 0
    progressRecord.set('sessions_count', currentCount + 1)
    progressRecord.set('last_session_at', new Date().toISOString())

    const score = evaluation?.score || 0
    let level = progressRecord.getInt('mastery_level') || 1
    if (score >= 90) {
      level = Math.min(4, level + 1)
    } else if (score >= 70) {
      if (currentCount > 2) level = Math.max(level, 2)
    }

    progressRecord.set('mastery_level', level)
    $app.save(progressRecord)

    const sessionCol = $app.findCollectionByNameOrId('study_sessions')
    const session = new Record(sessionCol)
    session.set('study_plan_id', study_plan_id)
    session.set('member_id', member_id)
    session.set('topic_id', topic_id)
    session.set('topic_label', topic_label)
    session.set('tutor_evaluation', evaluation)
    session.set('status', 'completed')
    $app.save(session)

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
