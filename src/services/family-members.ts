import pb from '@/lib/pocketbase/client'

export interface FamilyMember {
  id: string
  family_id: string
  name: string
  member_type: 'adult' | 'child'
  photo_url?: string
}

export const getFamilyMembers = (familyId: string) => {
  return pb.collection('family_members').getFullList<FamilyMember>({
    filter: `family_id = "${familyId}"`,
    sort: 'name',
  })
}
