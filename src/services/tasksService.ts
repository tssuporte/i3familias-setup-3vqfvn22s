import pb from '@/lib/pocketbase/client'

export const getChildTasks = async (familyId: string) => {
  try {
    return await pb.collection('tasks_children').getFullList({
      filter: `family_id = "${familyId}"`,
      expand: 'assigned_to',
      sort: '-created',
    })
  } catch (err) {
    throw new Error('Não foi possível carregar as tarefas das crianças.')
  }
}

export const createChildTask = async (data: any) => {
  try {
    return await pb.collection('tasks_children').create(data)
  } catch (err) {
    throw new Error('Erro ao criar a tarefa para a criança.')
  }
}

export const completeChildTask = async (id: string, photoUrl?: string) => {
  try {
    const data: any = { status: 'completed', completed_at: new Date().toISOString() }
    if (photoUrl) {
      data.photo_url = photoUrl
    }
    return await pb.collection('tasks_children').update(id, data)
  } catch (err) {
    throw new Error('Erro ao concluir a tarefa.')
  }
}

export const getAdultTasks = async (familyId: string) => {
  try {
    return await pb.collection('tasks_adults').getFullList({
      filter: `family_id = "${familyId}"`,
      expand: 'assigned_to,created_by',
      sort: 'due_date,-priority',
    })
  } catch (err) {
    throw new Error('Não foi possível carregar as tarefas dos adultos.')
  }
}

export const getAdultTasksByMember = async (memberId: string) => {
  try {
    return await pb.collection('tasks_adults').getFullList({
      filter: `assigned_to = "${memberId}"`,
      expand: 'assigned_to,created_by',
      sort: 'due_date,-priority',
    })
  } catch (err) {
    throw new Error('Erro ao carregar as tarefas específicas do adulto.')
  }
}

export const createAdultTask = async (data: any) => {
  try {
    return await pb.collection('tasks_adults').create(data)
  } catch (err) {
    throw new Error('Erro ao criar a tarefa para o adulto.')
  }
}

export const completeAdultTask = async (id: string) => {
  try {
    return await pb.collection('tasks_adults').update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
  } catch (err) {
    throw new Error('Erro ao marcar a tarefa do adulto como concluída.')
  }
}

export const getWeekLeader = async (familyId: string) => {
  try {
    return await pb.collection('week_leader').getFirstListItem(`family_id = "${familyId}"`, {
      expand: 'leader_id',
      sort: '-week_start_date',
    })
  } catch (err) {
    return null
  }
}

export const setWeekLeader = async (data: any) => {
  try {
    return await pb.collection('week_leader').create(data)
  } catch (err) {
    throw new Error('Erro ao definir o líder da semana.')
  }
}

export const getPendingConfirmations = async (leaderId: string) => {
  try {
    return await pb.collection('week_leader_confirmations').getFullList({
      filter: `week_leader_id = "${leaderId}" && confirmed = false`,
      expand: 'task_id,sibling_id',
    })
  } catch (err) {
    throw new Error('Erro ao carregar as confirmações pendentes.')
  }
}

export const confirmSiblingTask = async (confirmationId: string) => {
  try {
    return await pb.collection('week_leader_confirmations').update(confirmationId, {
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    })
  } catch (err) {
    throw new Error('Erro ao confirmar a tarefa do irmão.')
  }
}
