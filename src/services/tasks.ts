import pb from '@/lib/pocketbase/client'

export const getPendingChildTasks = (memberId: string) => {
  return pb.collection('tasks_children').getFullList({
    filter: `assigned_to = "${memberId}" && status = "pending"`,
    sort: 'due_time',
  })
}

export const completeChildTask = async (taskId: string, photoDataUrl?: string) => {
  const data: any = {
    status: 'completed',
    completed_at: new Date().toISOString(),
  }

  if (photoDataUrl) {
    data.photo_url = photoDataUrl
  }

  return pb.collection('tasks_children').update(taskId, data)
}
