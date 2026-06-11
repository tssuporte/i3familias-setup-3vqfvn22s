import pb from '@/lib/pocketbase/client'

export async function getStudyPlan(memberId: string, year: number) {
  try {
    return await pb
      .collection('study_plans')
      .getFirstListItem(`member_id = "${memberId}" && year = ${year}`)
  } catch (err) {
    return null
  }
}

export async function createStudyPlan(data: any) {
  return await pb.collection('study_plans').create(data)
}

export async function updateStudyPlan(id: string, data: any) {
  return await pb.collection('study_plans').update(id, data)
}

export async function getTopicProgress(memberId: string, planId: string) {
  return await pb.collection('topic_progress').getFullList({
    filter: `member_id = "${memberId}" && study_plan_id = "${planId}"`,
  })
}

export async function saveStudyEvaluation(data: {
  study_plan_id: string
  member_id: string
  topic_id: string
  topic_label: string
  evaluation: any
}) {
  return await pb.send('/backend/v1/study-sessions/save-evaluation', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
