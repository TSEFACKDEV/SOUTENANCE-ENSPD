import { create } from 'zustand'
import { Notification } from '@/types'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
