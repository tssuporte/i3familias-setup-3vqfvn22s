import pb from '@/lib/pocketbase/client'

export interface MemberAccountData {
  family_id: string
  member_id: string
  username: string
  email?: string
  password?: string
  passwordConfirm?: string
  role: string
}

export const getMemberAccount = (memberId: string) =>
  pb.collection('member_accounts').getFirstListItem(`member_id="${memberId}"`)

export const getFamilyMemberAccounts = (familyId: string) =>
  pb.collection('member_accounts').getFullList({ filter: `family_id="${familyId}"` })

export const createMemberAccount = (data: MemberAccountData) =>
  pb.collection('member_accounts').create(data)

export const updateMemberUsername = (accountId: string, username: string) =>
  pb.collection('member_accounts').update(accountId, { username })

export const resetMemberPassword = (accountId: string, password: string) =>
  pb.collection('member_accounts').update(accountId, { password, passwordConfirm: password })

export const deleteMemberAccount = (accountId: string) =>
  pb.collection('member_accounts').delete(accountId)
