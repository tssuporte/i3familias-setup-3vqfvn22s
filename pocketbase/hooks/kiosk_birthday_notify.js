routerAdd(
  'POST',
  '/backend/v1/kiosk/birthday-notify',
  (e) => {
    const body = e.requestInfo().body || {}
    const memberId = body.memberId

    if (!memberId) {
      return e.badRequestError('memberId is required')
    }

    try {
      const member = $app.findRecordById('family_members', memberId)
      const familyId = member.getString('family_id')

      const adults = $app.findRecordsByFilter(
        'family_members',
        "family_id = {:familyId} && member_type = 'adult'",
        '',
        100,
        0,
        { familyId: familyId },
      )

      // Simulate push notification by logging it on the server
      $app
        .logger()
        .info(
          'Birthday push notification simulated',
          'member',
          member.getString('name'),
          'adultsNotified',
          adults.length,
        )

      return e.json(200, { success: true, notified: adults.length })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
