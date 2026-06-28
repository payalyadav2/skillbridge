import { create } from 'zustand'
import { notificationApi } from '../api/notificationApi'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (params) => {
    set({ isLoading: true })
    try {
      const { data } = await notificationApi.getNotifications(params)
      set({ notifications: data.data })
    } catch {} finally { set({ isLoading: false }) }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationApi.getUnreadCount()
      set({ unreadCount: data.data.count })
    } catch {}
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id)
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch {}
  },

  deleteNotification: async (id) => {
    try {
      await notificationApi.deleteNotification(id)
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
      }))
    } catch {}
  },
}))

export default useNotificationStore
