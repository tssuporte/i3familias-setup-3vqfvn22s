import pb from '@/lib/pocketbase/client'

export const getFamilyNotices = async (familyId: string) => {
  const now = new Date().toISOString()
  return await pb.collection('family_notices').getFullList({
    filter: `family_id = "${familyId}" && status = "active" && (expiry_date = "" || expiry_date >= "${now}")`,
    sort: '-created',
  })
}

export const notifyBirthday = async (memberId: string) => {
  return await pb.send('/backend/v1/kiosk/birthday-notify', {
    method: 'POST',
    body: JSON.stringify({ memberId }),
  })
}
