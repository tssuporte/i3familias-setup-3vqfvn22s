import pb from '@/lib/pocketbase/client'
import { Notification } from '@/types/notification'

export const getNotifications = () =>
  pb
    .collection('notifications')
    .getList<Notification>(1, 100, { sort: '-created' })
    .then((res) => res.items)

export const markAsRead = (id: string) =>
  pb.collection('notifications').update<Notification>(id, { read: true })

export const deleteNotification = (id: string) => pb.collection('notifications').delete(id)
