import pb from '@/lib/pocketbase/client'

export interface FamilyNotice {
  id: string
  family_id: string
  content: string
  author_name: string
  status: 'active' | 'inactive'
  expiry_date?: string
  created: string
  updated: string
}

export const getNotices = (familyId: string) => {
  return pb.collection('family_notices').getFullList<FamilyNotice>({
    filter: `family_id = "${familyId}"`,
    sort: '-created',
  })
}

export const createNotice = (data: Partial<FamilyNotice>) => {
  return pb.collection('family_notices').create<FamilyNotice>(data)
}

export const updateNotice = (id: string, data: Partial<FamilyNotice>) => {
  return pb.collection('family_notices').update<FamilyNotice>(id, data)
}
