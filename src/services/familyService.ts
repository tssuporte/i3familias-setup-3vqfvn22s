import pb from '@/lib/pocketbase/client'

export const createFamily = async (data: any) => {
  try {
    const userId = pb.authStore.record?.id
    if (!userId) throw new Error('Usuário não autenticado')
    return await pb.collection('families').create({
      ...data,
      user_id: userId,
    })
  } catch (err: any) {
    throw new Error('Não foi possível criar a família. Verifique os dados e tente novamente.')
  }
}

export const getFamily = async (family_id: string) => {
  try {
    return await pb.collection('families').getOne(family_id)
  } catch (err: any) {
    throw new Error('Não foi possível carregar os dados da família.')
  }
}

export const getFamilyByUserId = async (user_id: string) => {
  try {
    return await pb.collection('families').getFirstListItem(`user_id="${user_id}"`)
  } catch (err: any) {
    return null
  }
}

export const addFamilyMember = async (data: any) => {
  try {
    return await pb.collection('family_members').create(data)
  } catch (err: any) {
    throw new Error('Não foi possível adicionar o membro da família.')
  }
}

export const getFamilyMembers = async (family_id: string) => {
  try {
    return await pb.collection('family_members').getFullList({ filter: `family_id="${family_id}"` })
  } catch (err: any) {
    throw new Error('Não foi possível carregar os membros da família.')
  }
}

export const updateFamilyMember = async (member_id: string, data: any) => {
  try {
    return await pb.collection('family_members').update(member_id, data)
  } catch (err: any) {
    throw new Error('Não foi possível atualizar o membro da família.')
  }
}
